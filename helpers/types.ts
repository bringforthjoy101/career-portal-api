export type RegisterDataType = {
	names: string;
	phone: string;
	email: string;
	password: string;
	role?: string;
};

export type AuthPayloadDataType = {
	id: number;
	names: string;
	phone: string;
	email: string;
	status: string;
	role?: string;
	type: string;
};

export type TokenDataType = {
	type: 'token' | '2fa';
	token: string;
	candidate?: AuthPayloadDataType;
	admin?: AuthPayloadDataType;
};

export type SendMailDataType = {
	mailRecipients: string[] | string;
	mailSubject: string;
	mailBody: string;
	mailAttachments?: string;
};

export type PrepareMailDataType = {
	mailRecipients: string[] | string;
	mailSubject: string;
	mailBody: string;
};

export type ContactUsTemplateDataType = {
	name: string;
	email: string;
	phone: string;
	subject: string;
	message: string;
};

export type SubscribeTemplateDataType = {
	firstName: string;
	email: string;
};

export type OtpDetailsDataType = {
	timestamp: Date;
	email: string;
	password?: string;
	success: boolean;
	message: string;
	otpId: number;
};
export enum typeEnum {
	VERIFICATION = 'verification',
	RESET = 'reset',
	TWOFA = '2fa',
}

export type SendOtpDataType = {
	email: string;
	type: typeEnum;
	password?: string;
};

export type OtpMailTemplateDataType = {
	subject: string;
	body: string;
};

export type GetOtpTemplateDataType = {
	otp: number;
	type: typeEnum;
};

export type PaymentNotifTemplateDataType = {
	party: payEnum;
	paymentData: any;
};

export type VerifyOtpDataType = {
	token: string;
	otp: number;
	email: string;
	type: typeEnum;
};

export type LoginDataType = {
	email: string;
	password: string;
};

export type FnResponseDataType = {
	status: boolean;
	message: string;
	data?: any;
};

export type ChangePasswordDataType = {
	token: string;
	password: string;
};

export type SendSmsDataType = {
	phone: string[];
	text: string;
};

export type PrepareSmsDataType = {
	recipents: string;
};

export enum AdminRoles {
	CONTROL = 'control',
	SUPPORT = 'support',
}

export enum ModelStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
}

export enum payEnum {
	PAYEE = 'payee',
	PAYER = 'payer',
}

export enum ValidStatus {
	ACTIVATED = 'activate',
	DEACTIVATED = 'deactivate',
}

export type BusinessDataType = {
	name: string;
	address: string;
	phone: string;
	email: string;
	state: string;
	country: string;
	status?: ModelStatus;
};

export type IdsDataType = {
	ids: string[];
};

export type DocumentDataType = {
	name: string;
	file: string;
	candidateId: number | string;
};

export type VacancyDataType = {
	name: string;
	description: string;
	closedAt: string;
};

export type ApplicationDataType = {
	vacancyId: number;
	candidateId: number;
};

export type PaymentLogDataType = {
	payeeName: string;
	payeePhone?: string;
	payeeEmail?: string;
	amount: number;
	transRef: string;
	businessId: number;
	branchId: number;
	revenueHeadId: number;
	agentId: number;
};
