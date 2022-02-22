// Import packages
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Import DB and configs
import DB from '../controllers/db';
import config from '../config/configSetup';

// Import types & function files
import { SendOtpDataType, OtpDetailsDataType, LoginDataType, AuthPayloadDataType, TokenDataType } from './types';
import { generateOtp, addMinutesToDate, fnResponse } from './utility';
import { getOtpTemplateData } from './mailer/templateData';
import { prepareMail } from './mailer/mailer';
import { otpMailTemplate } from './mailer/template';

export const sendOtp = async ({ email, type, password }: SendOtpDataType) => {
	try {
		//Generate OTP
		const otp: number = generateOtp(),
			now: Date = new Date(),
			expirationTime: Date = addMinutesToDate(now, 10);

		const otpInstance = await DB.otp.create({ otp, expirationTime });

		// Create details object containing the email and otp id
		const otpDetails: OtpDetailsDataType = {
			timestamp: now,
			email,
			password,
			success: true,
			message: 'OTP sent to agent',
			otpId: otpInstance.id,
		};

		// Encrypt the details object
		const encoded: string = jwt.sign(JSON.stringify(otpDetails), config.JWTSECRET);

		const { mailSubject, mailBody } = getOtpTemplateData({ otp, type });

		// prepare and send mail
		const sendEmail = await prepareMail({
			mailRecipients: email,
			mailSubject,
			mailBody: otpMailTemplate({ subject: mailSubject, body: mailBody }),
		});

		console.log(sendEmail);

		if (sendEmail.status) return fnResponse({ status: true, message: 'OTP Sent', data: encoded });
		return fnResponse({ status: false, message: 'OTP not sent' });
	} catch (error: any) {
		console.log(error);
		return fnResponse({ status: false, message: `An error occured:- ${error}` });
	}
};

export const login = async ({ email, password }: LoginDataType) => {
	try {
		const candidate = await DB.candidates.findOne({ where: { email }, attributes: { exclude: ['createdAt', 'updatedAt'] } });

		if (candidate) {
			const validPass: boolean = await bcrypt.compareSync(password, candidate.password);
			if (!validPass) return fnResponse({ status: false, message: 'Email or Password is incorrect!' });

			if (candidate.status === 'inactive') return fnResponse({ status: false, message: 'Account Suspended!, Please contact support!' });

			// Create and assign token
			let payload: AuthPayloadDataType = {
				id: candidate.id,
				email,
				names: candidate.names,
				phone: candidate.phone,
				status: candidate.status,
				type: 'candidate',
			};
			const token: string = jwt.sign(payload, config.JWTSECRET);
			const data: TokenDataType = { type: 'token', token, candidate: payload };
			return fnResponse({ status: true, message: 'Login successfull', data });
		} else {
			return fnResponse({ status: false, message: 'Incorrect Email' });
		}
	} catch (error) {
		console.log(error);
		return fnResponse({ status: false, message: `An error occured - ${error}` });
	}
};

export const activateAccount = async (email: string) => {
	try {
		const agent = await DB.agents.findOne({ where: { email }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
		agent.update({ status: 'active' });
		return fnResponse({ status: true, message: 'User Activated' });
	} catch (error) {
		console.log(error);
		return fnResponse({ status: false, message: `An error occured - ${error}` });
	}
};
