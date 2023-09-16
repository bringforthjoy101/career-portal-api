// Import packages
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer'

// Import configs
import config from '../../config/configSetup';

// Import function files
import { SendMailDataType, PrepareMailDataType } from '../types';

export const sendMail = async ({ mailRecipients, mailSubject, mailBody, mailAttachments }: SendMailDataType) => {
	try {
		sgMail.setApiKey(config.SENDGRID_API_KEY);

		const msg = {
			to: mailRecipients,
			from: `${config.MAIL_FROM_NAME} <${config.MAIL_FROM}>`,
			subject: mailSubject,
			html: mailBody,
		};

		sgMail.send(msg).then(
			() => {
				console.log(`Email sent to ${mailRecipients}`);
			},
			(error) => {
				console.error('hello', error);
				return {
					status: false,
					message: `Email not sent ${error}`,
				};
			}
		);
		return {
			status: true,
			message: `Email sent successfully to ${mailRecipients}`,
		};
	} catch (error) {
		console.log(error);
		return {
			status: false,
			message: `Email not sent ${error}`,
			email: mailRecipients,
		};
	}
};

export const sendMailNodeMailer = async ({ senderName, senderEmail, mailRecipients, mailSubject, mailBody, mailAttachments }: SendMailDataType) => {
	try {
		// sgMail.setApiKey(config.SENDGRID_API_KEY);
		// console.log({senderEmail})
		const transporter = nodemailer.createTransport({
			name: "mail.veniteuniversity.edu.ng",
			host: "mail.veniteuniversity.edu.ng",
			port: 465,
			secure: true,
			auth: {
				// TODO: replace `user` and `pass` values from <https://forwardemail.net>
				user: senderEmail,
				pass: 'P@ssword123'
			},
		});
		// console.log({ mailRecipients })

		await new Promise((resolve, reject) => {
			// verify connection configuration
			transporter.verify(function (error, success) {
				if (error) {
					console.log(error);
					reject(error);
				} else {
					console.log("Server is ready to take our messages");
					resolve(success);
				}
			});
		});

		const info = await transporter.sendMail({
			from: {
				name: senderName,
				address: senderEmail
			}, // sender address
			to: mailRecipients, // list of receivers
			subject: mailSubject, // Subject line
			html: mailBody, // html body
		});

		// console.log(JSON.stringify({info}))
		console.log("Message sent: %s", info.messageId);
		if(info.messageId) {
			return {
				status: true,
				message: `Email sent`,
			};
		}
		return {
			status: false,
			message: `Email not sent`,
		};
	} catch (error) {
		console.log(error);
		return {
			status: false,
			message: `Email not sent ${error}`,
			email: mailRecipients,
		};
	}
};

export const prepareMail = async ({ mailRecipients, mailSubject, mailBody, senderName, senderEmail }: PrepareMailDataType) => {
	const _sendMail: any = await sendMailNodeMailer({
		senderName,
		senderEmail,
		mailRecipients,
		mailSubject,
		mailBody,
	});
	return { status: _sendMail.status, message: _sendMail.message };
};
