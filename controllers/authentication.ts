// Import packages
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Import db & configs
import config from '../config/configSetup';
import DB from './db';

// Import function files
import { handleResponse, successResponse, errorResponse, otpValidity } from '../helpers/utility';
import {
	RegisterDataType,
	TokenDataType,
	typeEnum,
	VerifyOtpDataType,
	FnResponseDataType,
	ChangePasswordDataType,
	MailType,
} from '../helpers/types';
import { activateAccount, login, sendOtp } from '../helpers/auth';
import { checkBranch, checkBusiness } from '../helpers/middlewares';
import { getNotificationTemplateData, getOtpTemplateData } from '../helpers/mailer/templateData';
import { prepareMail } from '../helpers/mailer/mailer';
import { mailTemplate } from '../helpers/mailer/template';

export const register = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}

	const { names, phone, email, password } = req.body;

	//Hash password
	const salt: string = await bcrypt.genSalt(15);
	const hashPassword: string = await bcrypt.hash(password, salt);

	let insertData: RegisterDataType = { names, phone, email, password: hashPassword };

	try {
		const candidateExists: any = await DB.candidates.findOne({ where: { email }, attributes: { exclude: ['createdAt', 'updatedAt'] } });

		// if candidate exists, stop the process and return a message
		if (candidateExists) return handleResponse(res, 400, false, `candidate with email ${email} already exists`);
		const candidate: any = await DB.candidates.create(insertData);

		if (candidate) return handleResponse(res, 200, true, `Registration successfull`);
		return handleResponse(res, 401, false, `An error occured`);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

export const preLogin = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}

	const { email, password } = req.body;

	try {
		const candidate = await DB.candidates.findOne({
			where: { email },
			attributes: { exclude: ['createdAt', 'updatedAt'] },
		});

		if (candidate) {
			const loginResponse: FnResponseDataType = await login({ email, password });
			if (!loginResponse.status) return errorResponse(res, loginResponse.message);
			return successResponse(res, loginResponse.message, loginResponse.data);
		} else {
			return handleResponse(res, 401, false, `Incorrect Email`);
		}
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

export const dahsboard = async (req: Request, res: Response) => {
	try {
		const data = [];
		const where: any = {};
		if (req.candidate) {
			where.candidateId = req.candidate.id;
			const documents = await DB.documents.findAll({
				where,
				attributes: { exclude: ['createdAt', 'updatedAt'] },
			});
			data.push({ name: 'Documents', value: documents.length });
		} else {
			const candidates = await DB.candidates.findAll({
				attributes: { exclude: ['createdAt', 'updatedAt'] },
			});
			data.push({ name: 'Candidates', value: candidates.length });

			const admins = await DB.admins.findAll({
				attributes: { exclude: ['createdAt', 'updatedAt'] },
			});
			data.push({ name: 'Admins', value: admins.length });
		}
		const vacancies = await DB.vacancies.findAll({
			attributes: { exclude: ['createdAt', 'updatedAt'] },
		});
		data.push({ name: 'Vacancies', value: vacancies.length });

		const applications = await DB.applications.findAll({
			where,
			attributes: { exclude: ['createdAt', 'updatedAt'] },
		});
		data.push({ name: 'Applications', value: applications.length });

		return successResponse(res, 'Dashboard data retrieved', data);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

export const updatePassword = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}

	const { email, oldPassword, newPassword } = req.body;
	try {
		const candidate = await DB.candidates.findOne({ where: { email, status: 'active' }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
		if (!candidate) return errorResponse(res, `candidate not found!`);
		const validPassword: boolean = await bcrypt.compareSync(oldPassword, candidate.password);
		if (!validPassword) return errorResponse(res, `Incorrect  old password!`);
		const salt: string = await bcrypt.genSalt(15);
		const hashPassword: string = await bcrypt.hash(newPassword, salt);
		const updatedPassword: any = await candidate.update({ password: hashPassword });
		if (!updatedPassword) return errorResponse(res, `Unable update password!`);
		return successResponse(res, `Password updated successfully`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

export const resetPassword = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}

	const { email } = req.body;

	try {
		const candidate = await DB.candidates.findOne({
			where: { email },
			attributes: { exclude: ['createdAt', 'updatedAt'] },
		});

		if (candidate) {
			const sendOtpResponse: FnResponseDataType = await sendOtp({ email, type: typeEnum.RESET });
			if (!sendOtpResponse.status) return errorResponse(res, sendOtpResponse.message);
			return successResponse(res, sendOtpResponse.message, sendOtpResponse.data);
		} else {
			return handleResponse(res, 401, false, `Incorrect Email`);
		}
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

export const changePassword = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { token, password }: ChangePasswordDataType = req.body;

	try {
		const decoded: any = jwt.verify(token, config.JWTSECRET);
		if (!decoded) return errorResponse(res, `Invalid verification`);

		const candidate = await DB.candidates.findOne({
			where: { email: decoded.email, status: 'active' },
			attributes: { exclude: ['createdAt', 'updatedAt'] },
		});
		if (!candidate) return errorResponse(res, `Account Suspended!, Please contact support!`);
		const salt: string = await bcrypt.genSalt(15);
		const hashPassword: string = await bcrypt.hash(password, salt);
		const updatedPassword: any = await candidate.update({ password: hashPassword });
		if (!updatedPassword) return errorResponse(res, `Unable update password!`);
		return successResponse(res, `Password changed successfully`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

export const verifyOtp = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	try {
		var currentdate = new Date();
		const { token, otp, email, type }: VerifyOtpDataType = req.body;
		const decoded: any = jwt.verify(token, config.JWTSECRET);
		if (!decoded) return errorResponse(res, `Invalid verification`);

		if (decoded.email != email) return errorResponse(res, `OTP was not sent to this particular email`);

		const otpInstance = await DB.otp.findOne({ where: { id: decoded.otpId } });

		if (!otpInstance) return errorResponse(res, `OTP does not exists`);
		if (otpInstance.verified) return errorResponse(res, `OTP Already Used`);
		if (!otpValidity(otpInstance.expirationTime, currentdate)) return errorResponse(res, 'OTP Expired');
		if (otp != otpInstance.otp) return errorResponse(res, 'OTP NOT Matched');

		const updateData = { verified: true, verifiedAt: currentdate };
		await otpInstance.update(updateData);

		if (type === typeEnum.TWOFA) {
			const loginResponse: FnResponseDataType = await login({ email, password: decoded.password });
			if (!loginResponse.status) return errorResponse(res, loginResponse.message);
			return successResponse(res, 'Login Successful', loginResponse.data);
		} else if (type === typeEnum.RESET) {
			if (decoded.password) return errorResponse(res, 'Suspicious attempt discovered! Pls reset password again');
			return successResponse(res, 'OTP Matched', token);
		} else {
			const accountActivated = await activateAccount(email);
			if (!accountActivated.status) return errorResponse(res, accountActivated.message);
			return successResponse(res, 'Email verified', email);
		}
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

export const updateUserSettings = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { twoFa } = req.body;
	const { id } = req.candidate;

	try {
		const candidate = await DB.candidates.findOne({ where: { id } });
		const updatedSettings: any = await candidate.update({ twoFa });
		if (!updatedSettings) return errorResponse(res, `Unable update settings!`);
		return successResponse(res, `Settings updated successfully`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

export const sendGuide = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return errorResponse(res, 'Validation Error', errors.array());

	// const { email, phone, type } = req.body;
	// const { email, phone, type, businessId } = req.body;
	try {

		const users = await DB.candidates.findAll({ where: {onboard: false}, limit: 2, attributes: ['email', 'names']});
		// console.log({ users })
		console.log(users.map(({ email, names }: {email: string, names: string}) => {
			return { email, names };
		}))
		const userEmails = users.map(({ email, names }: {email: string, names: string}) => {
			return { email, names };
		})

		setTimeout(async ()=> {
			for (const user of userEmails) {
				console.log({ user })
				const { mailSubject, mailBody } = getNotificationTemplateData({ data: {name: user.names}, type: MailType.APPLICATION_GUIDE });
				// prepare and send mail
				const sendEmail = await prepareMail({
					mailRecipients: user.email,
					mailSubject,
					mailBody: mailTemplate({ subject: mailSubject, body: mailBody }),
					senderName: config.MAIL_FROM_NAME,
					senderEmail: config.MAIL_FROM,
				});
				console.log({sendEmail})
				if(sendEmail.status) DB.candidates.update({onboard: true},{where: {email: user.email}})
			}
		}, 10000)




		// if (sendEmail.status) return fnResponse({ status: true, message: 'OTP Sent', data: encoded });
		// return fnResponse({ status: false, message: 'OTP not sent' });
		// if (!regData.status) return errorResponse(res, 'An error occured');
		return successResponse(res, `Successful`,);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

export const acknowledge = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return errorResponse(res, 'Validation Error', errors.array());

	// const { email, phone, type } = req.body;
	// const { email, phone, type, businessId } = req.body;
	try {

		const applications = await DB.applications.findAll({ where: {acknowledged: false, status:'pending'}, include:[{model: DB.candidates, attributes:['email', 'names']},{model: DB.vacancies, attributes:['name']}]});
		const applicants = applications.map(({ id, candidate, vacancy }: {id: string, candidate: any, vacancy: any}) => {
			return { id, candidate, vacancy };
		})

		// console.log(JSON.stringify({applicants}))

		setTimeout(async ()=> {
			for (const applicant of applicants) {
				console.log({name: applicant.candidate.names, position: applicant.vacancy.name, email: applicant.candidate.email})
				const { mailSubject, mailBody } = getNotificationTemplateData({ data: {name: applicant.candidate.names, position: applicant.vacancy.name}, type: MailType.APPLICATION_SUCCESS });
				// prepare and send mail
				const sendEmail = await prepareMail({
					mailRecipients: applicant.candidate.email,
					mailSubject,
					mailBody: mailTemplate({ subject: mailSubject, body: mailBody }),
					senderName: config.MAIL_FROM_NAME,
					senderEmail: config.MAIL_FROM,
				});
				console.log({sendEmail})
				if(sendEmail.status) await DB.applications.update({acknowledged: true},{where: {id: applicant.id}})
			}
		}, 10000)

		// if (sendEmail.status) return fnResponse({ status: true, message: 'OTP Sent', data: encoded });
		// return fnResponse({ status: false, message: 'OTP not sent' });
		// if (!regData.status) return errorResponse(res, 'An error occurred');
		return successResponse(res, `Successful`,);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};
