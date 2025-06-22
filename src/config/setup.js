import dotenv from 'dotenv';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose'
import { light, dark, noSidebar } from '@adminjs/themes';
import { COOKIE_PASSWORD } from './config.js';
import ConnectMongoDBSession from 'connect-mongodb-session';
import session from 'express-session';
import User from '../model/user.js';
import Bus from '../model/bus.js'
import Ticket from '../model/ticket.js'


dotenv.config();

AdminJS.registerAdapter(AdminJSMongoose);

const DEFAULT_ADMIN = {
    email: process.env.ADMIN_LOGIN_EMAIL,
    password: process.env.ADMIN_LOGIN_PASSWORD,
};

const authenticate = async (email, password) => {
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
        return Promise.resolve(DEFAULT_ADMIN);
    };
    return null;

}

export const buildAdminJS = async (app) => {
    const admin = new AdminJS({
        resources: [
            { resource: User}, { resource: Bus }, { resource: Ticket }
        ],
        defaultTheme : dark.id,
        availableThemes : [dark,light,noSidebar],
        rootPath : "/admin",
    });

    const MongoDBStore = ConnectMongoDBSession(session);
    const sessionStore = new MongoDBStore({
        uri : process.env.MONGO_URI,
        collection : "sessions",
    });

    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
        admin,
        {
            cookieName : "adminjs",
            cookiePassword : COOKIE_PASSWORD,
            authenticate,
        },
        null,
        {
            store : sessionStore,
            resave : true,
            saveUninitialized : true,
            secret : COOKIE_PASSWORD,
            cookie : {
                httpOnly : process.env.NODE_ENV === "production",
                secure : process.env.NODE_ENV === "production",
            },
            name : "adminjs", 
        }
    );

    app.use(admin.options.rootPath, adminRouter);
};