import * as dotenv from 'dotenv';
dotenv.config();

type Config = {
	NODE_ENV: string;
	PORT: number;
	SSL: boolean;
	JWTSECRET: string;
	JWT_EXPIRY_TIME: string;
	DBNAME: string;
	DBUSERNAME: string;
	DBPASSWORD: string;
	DBHOST: string;
	DBPORT: number;
	DBDIALECT: string;
	WEBSITE: string;
	LOGO: string;
	MAIL_FROM: string;
	MAIL_FROM_NAME: string;
	SENDGRID_API_KEY: string;
	TWILLIO_ACCOUNT_SID: string;
	TWILLIO_AUTH_TOKEN: string;
	TWILLIO_MESSAGE_SERVICE_ID: string;
	PUBLIC_ROUTES: string[] | [];
};

const getConfig = (): Config => {
	return {
		NODE_ENV: process.env.NODE_ENV,
		PORT: Number(process.env.PORT),
		SSL: true,
		JWTSECRET: process.env.JWTSECRET,
		JWT_EXPIRY_TIME: process.env.JWT_EXPIRY_TIME,
		DBNAME: process.env.DBNAME,
		DBUSERNAME: process.env.DBUSERNAME,
		DBPASSWORD: process.env.DBPASSWORD,
		DBHOST: process.env.DBHOST,
		DBPORT: Number(process.env.DBPORT),
		DBDIALECT: process.env.DBDIALECT,
		WEBSITE: process.env.WEBSITE,
		LOGO: process.env.LOGO,
		MAIL_FROM: process.env.MAIL_FROM,
		MAIL_FROM_NAME: process.env.MAIL_FROM_NAME,
		SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
		TWILLIO_ACCOUNT_SID: process.env.TWILLIO_ACCOUNT_SID,
		TWILLIO_AUTH_TOKEN: process.env.TWILLIO_AUTH_TOKEN,
		TWILLIO_MESSAGE_SERVICE_ID: process.env.TWILLIO_MESSAGE_SERVICE_ID,
		PUBLIC_ROUTES: [
			'/',
			'/send',
			'/acknowledge',
			'/candidate/login',
			'/candidate/register',
			'/send-otp',
			'/verify-otp',
			'/change-password',
			'/reset-password',
			'/admin/login',
			'/admin/change-password',
			'/admin/reset-password',
		],
	};
};

const getSanitzedConfig = (config: Config) => {
	for (const [key, value] of Object.entries(config)) {
		if (value === undefined) {
			throw new Error(`Missing key ${key} in .env`);
		}
	}
	return config as Config;
};

const config = getConfig();
const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;
