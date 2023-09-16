import moment from 'moment';
// Import types
import { GetOtpTemplateDataType, PaymentNotifTemplateDataType, typeEnum, MailType } from '../types';
import { formatCurrency } from '../utility';

export const getOtpTemplateData = ({ otp, type }: GetOtpTemplateDataType) => {
	if (type === typeEnum.VERIFICATION) {
		return {
			mailSubject: 'Email Verification',
			mailBody: `
				<p>OTP for your email verification is :</p>
				<p>${otp}</p>
				<p>This Otp is valid for only 10 minutes</p>
			`,
		};
	} else if (type === typeEnum.RESET) {
		return {
			mailSubject: 'Password Reset',
			mailBody: `
				<p>OTP for your password reset request is :</p>
				<p>${otp}</p>
				<p>This Otp is valid for only 10 minutes</p>
			`,
		};
	} else {
		return {
			mailSubject: 'Two Factor Authentication',
			mailBody: `
				<p>OTP for your 2FA is :</p>
				<p>${otp}</p>
				<p>This Otp is valid for only 10 minutes</p>
			`,
		};
	}
};

export const getNotificationTemplateData = ({ data, type }: { data: any; type: MailType }) => {
	switch (type) {
		case MailType.REG_SUCCESS:
			return {
				mailSubject: 'Welcome to VENITE',
				mailBody: `
					<p style="font-weight: 600; font-size: 18px; margin-bottom: 0;">Welcome to Venite University career portal,</p>
					<p>Hello ${data.name}, We sincerely appreciate your interest in pursuing a career with Venite University. We are delighted that you've taken the first step by signing up for our job application portal</p>
					<p>A follow-up email to guide you on the process to follow for a succesfull job application will be sent to you shortly.</p>
					<p>If you have any issues as regards anything on the portal, reach out to us on info@veniteuniversity.edu.ng </p>
					<p style="font-weight: 600;">Thank you!</p>
					<p style="font-weight: 600;">VENITE</p>
					`,
				// <p>Luka ID:- ${data.business.lukaId}</p>
			};
		case MailType.APPLICATION_GUIDE:
			return {
				mailSubject: 'VENITE Application Guide',
				mailBody: `
					<p style="font-weight: 600; font-size: 18px; margin-bottom: 0;">Hello ${data.name},</p>
					<p>You have successfully signed up on VENITE Career portal.</p>
					<p>Here are setps to follow in completing a sucessful Application.</p>
					<br />
					<h3>Upload Documents:</h3>
					<ol>
						<li>Click on the 'Documents' menu. The loaded page is where all your documents/ credentials are expected to be uploaded. </li>
						<li>Click on the 'Add Document' button.</li>
						<li>Input the document or credential title.</li>
						<li>Input the document or credential file url. You are expected to upload your documents to an external or remote storage (e.g Google Drive) and provide the link to it here</li>
						<li>Click on the submit button.</li>
						<li>You have successfully submitted/uploaded a document.</li>
						<li>Make sure you repeat this process for as many documents as you have.</li>
						<li>You can also delete any of your documents from the list of submitted documents.</li>
					</ol>
					<br />
					<h3>Check Vacancies:</h3>
					<ol>
						<li>Click on the 'Vacancies' menu. The loaded page is where all open vacancies are listed. </li>
						<li>Use the search box to search for any preferred vacancy.</li>
						<li>Click on the preferred vacancy name.</li>
						<li>Click on the 'Apply' button</li>
						<li>You have successfully Applied for that position.</li>
						<li>Feel free to apply for other applications you feel you are qualified for.</li>
					</ol>
					<br />
					<h3>Check You Applications:</h3>
					<ol>
						<li>Click on the 'Applications' menu. The loaded page is where all your applications are listed. </li>
						<li>You can as well see the status of each application.</li>
						<li>After your applciation has been reviewed, you will be sent a mail, updating you on the status of the application.</li>
					</ol>
					<br />
					<p>If you have any issues as regards anything on the portal, reach out to us on info@veniteuniversity.edu.ng </p>
					<p>Once again welcome to VENITE UNiversity and we wish you goodluck on your career application journey.</p>
					<p style="font-weight: 600;">With love from VENITE!</p>
					`,
				// <p>Luka ID:- ${data.business.lukaId}</p>
			};
		case MailType.APPLICATION_SUCCESS:
			return {
				mailSubject: `Successful Application for ${data.position}`,
				mailBody: `
					<p style="font-weight: 600; font-size: 18px; margin-bottom: 0;">Dear, ${data.name}</p>
					<p>This is to acknowledge the receipt of your application for the position of <b>${data.position}</b> at Venite University. We appreciate your interest in joining our team.</p>
					<p>We are pleased to inform you that your application has been successfully received and is currently under review by our hiring team. We do hope that your qualifications and experience will align well with the requirements of the position.</p>
					<p>The next steps in our recruitment process will involve a thorough evaluation of all applications, including interviews with selected candidates. We will be in touch with you regarding the status of your application and to schedule any necessary interviews.</p>
					<p>We understand that waiting for a response can be an anxious time, and we appreciate your patience during this process. If you have any questions or require further information in the meantime, please do not hesitate to reach out to us at info@veniteuniversity.edu.ng.</p>
					<p>Please remember to update all your necessary and required documents for the positions you applied for.</p>
					<p>Once again, thank you for considering a career with Venite University. We look forward to the possibility of working together and will be in touch soon with updates on your application status.</p>
					<p>Best Regards.</p>
					<p style="font-weight: 600;">With love from VENITE!</p>
					`,
			};
		case MailType.DAILY_INTEREST:
			return {
				mailSubject: `Luka Daily Interest | [${moment(new Date()).format('L')}]`,
				mailBody: `
					<p style="font-weight: 600; font-size: 18px; margin-bottom: 0;">Hi, ${data.name}</p>
					<p>Your daily earned wages of <b>NGN ${data.amount.toLocaleString()}</b> has just been added to your wallet. You now have <b>NGN ${data.balance.toLocaleString()}</b> available to use.</p>
				`,
			};
		case MailType.BUSINESS_WALLET_RESET:
			return {
				mailSubject: `Luka Wallet Reset`,
				mailBody: `
					<p style="font-weight: 600; font-size: 18px; margin-bottom: 0;">Hi, ${data.name}</p>
					<p>Today is expected to be payday for your staffs. Hence, their wallets has been reset to zero balance.</p>
				`,
			};
		case MailType.KYC_SUCCESS:
			return {
				mailSubject: 'Business Verification Success',
				mailBody: `
				<p style="font-weight: 600; font-size: 18px; margin-bottom: 0;">Hello, ${data.name}</p>
					<p>Your verification documents have been received and your company has been successfully registered.</p>
					<p>You can now go on to add all your employees to your employer dashboard so all your employees can have access to their earned wages.</p>
					<p>If you have any concern kindly send us an email on help@luka.finance.</p>
					<p style="font-weight: 600;">With love from Luka!</p>
				`,
			};
		case MailType.KYC_REJECTED:
			return {
				mailSubject: 'Business Verification Not Successful',
				mailBody: `
					<p style="font-weight: 600; font-size: 18px; margin-bottom: 0;">Hello, ${data.name}</p>
					<p>Your verification documents have been received and we will need you to review and update you documents.</p>
					<p>Our customer service will reach out to you within the next 24hours</p>
					<p>If you have any concern kindly send us an email on help@luka.finance.</p>
					<p style="font-weight: 600;">With love from Luka!</p>
					`,
			};
		case MailType.STAFF_WALLET_RESET:
			return {
				mailSubject: `Luka Wallet Reset`,
				mailBody: `
					<p style="font-weight: 600; font-size: 18px; margin-bottom: 0;">Hi, ${data.name}</p>
					<p>Today is expected to be your payday from <b>${data.businessName}</b>. Hence, your wallet has been reset to zero balance</p>
				`,
			};
		case MailType.BUSINESS_INVOICE:
			return {
				mailSubject: `Luka Monthly Invoice | ${data.invoice.title}`,
				mailBody: `
				<p style="font-weight: 600; font-size: 18px; margin-bottom: 0;">Hi, ${data.name}</p>
				<p>This is an invoice for your staffs' transactions for the afore mentioned subject. Thanks for using Luka Finance. </p>

				<table style="font-family: 'Montserrat',Arial,sans-serif; width: 100%;" width="100%" cellpadding="0" cellspacing="0" role="presentation">
					<tbody>
						<tr>
							<td style="font-family: 'Montserrat',Arial,sans-serif; font-size: 14px; padding: 16px;">
							<table style="font-family: 'Montserrat',Arial,sans-serif; width: 100%;" width="100%" cellpadding="0" cellspacing="0" role="presentation">
								<tbody>
									<tr>
										<td style="font-family: 'Montserrat',Arial,sans-serif; font-size: 14px;"><strong>Amount Due:</strong> NGN ${data.invoice.total.toLocaleString()}</td>
									</tr>
									<tr>
										<td style="font-family: 'Montserrat',Arial,sans-serif; font-size: 14px;"> <strong>Due By:</strong> ${moment(data.invoice.dueDate).format('LL')} </td>
									</tr>
								</tbody>
							</table>
							</td>
						</tr>
					</tbody>
				</table>

				<table style="font-family: 'Montserrat',Arial,sans-serif; width: 100%;" width="100%" cellpadding="0" cellspacing="0" role="presentation">
					<tbody>
						<tr>
							<td style="font-family: 'Montserrat',Arial,sans-serif;">
								<h3 style="font-weight: 700; font-size: 12px; margin-top: 0; text-align: left;">#${14502}</h3>
							</td>
							<td style="font-family: 'Montserrat',Arial,sans-serif;">
								<h3 style="font-weight: 700; font-size: 12px; margin-top: 0; text-align: right;">
									${moment(data.invoice.createdAt).format('LL')}
								</h3>
							</td>
						</tr>
						<tr>
						<td colspan="2" style="font-family: 'Montserrat',Arial,sans-serif;">
							<table style="font-family: 'Montserrat',Arial,sans-serif; width: 100%;" width="100%" cellpadding="0" cellspacing="0" role="presentation">
							<tbody>
								<tr>
									<th align="left" style="padding-bottom: 8px;">
										<p>Description</p>
									</th>
									<th align="right" style="padding-bottom: 8px;">
										<p>Amount</p>
									</th>
								</tr>
									<tr>
										<td style="font-family: 'Montserrat',Arial,sans-serif; font-size: 14px; padding-top: 10px; padding-bottom: 10px; width: 60%;" width="60%">
											${data.invoice?.items[0]?.description}
										</td>
										<td align="right" style="font-family: 'Montserrat',Arial,sans-serif; font-size: 14px; text-align: right; width: 40%;" width="40%">NGN ${data.invoice.total.toLocaleString()}</td>
									</tr>
								<tr>
									<td style="font-family: 'Montserrat',Arial,sans-serif; width: 60%;" width="60%">
										<p align="right" style="font-weight: 700; font-size: 14px; line-height: 24px; margin: 0; padding-right: 16px; text-align: right;">
										Total
										</p>
									</td>
									<td style="font-family: 'Montserrat',Arial,sans-serif; width: 40%;" width="40%">
										<p align="right" style="font-weight: 700; font-size: 14px; line-height: 24px; margin: 0; text-align: right;">
										NGN ${data.invoice.total.toLocaleString()}
										</p>
									</td>
								</tr>
							</tbody>
							</table>
						</td>
						</tr>
					</tbody>
				</table>
			`,
			};
		case MailType.TRANSACTION:
			return {
				mailSubject: `${data.type.toUpperCase()} Transaction`,
				mailBody: `
					<p style="font-weight: 600; font-size: 18px; margin-bottom: 0;">Hi, ${data.name}</p>
					<p>A ${
					data.type
				} transaction of <b>NGN ${data.amount.toLocaleString()}</b> occured in your wallet. You now have <b>NGN ${data.balance.toLocaleString()}</b> available to use.</p>
				`,
			};
		default:
			return {mailSubject: "", mailBody: ""};
	}
};
