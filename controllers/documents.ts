// Import packages
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

// Import db
import DB from './db';

// Import function files
import { handleResponse, successResponse, errorResponse } from '../helpers/utility';
import { DocumentDataType } from '../helpers/types';

// create document
const createDocument = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { name, file } = req.body;
	const insertData: DocumentDataType = { name, file };
	try {
		const documentExists: any = await DB.documents.findOne({
			where: { name, candidateId: req.candidate.id },
			attributes: { exclude: ['createdAt', 'updatedAt'] },
		});
		// if document exists, stop the process and return a message
		if (documentExists) return errorResponse(res, `document with name ${name} already exists`);
		const document: any = await DB.documents.create(insertData);
		if (document) return successResponse(res, `Document creation successfull`);
		return errorResponse(res, `An error occured`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

// get all documents
const getDocuments = async (req: Request, res: Response) => {
	try {
		const documents = await DB.documents.findAll({ where: { candidateId: req.candidate.id }, order: [['id', 'DESC']] });
		if (!documents.length) return successResponse(res, `No document available!`, []);
		return successResponse(res, `${documents.length} document${documents.length > 1 ? 'es' : ''} retrived!`, documents);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

// get document details
const getDocumentDetails = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	try {
		const document = await DB.documents.findOne({ where: { id } });
		if (!document) return errorResponse(res, `Document with ID ${id} not found!`);
		return successResponse(res, `Document details retrived!`, document);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

// update document
const updateDocument = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	const { name, file } = req.body;
	try {
		const document = await DB.documents.findOne({ where: { id }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
		if (!document) return errorResponse(res, `document not found!`);
		const updateData = {
			name: name || document.name,
			file: file || document.file,
		};
		const updatedDocument: any = await document.update(updateData);
		if (!updatedDocument) return errorResponse(res, `Unable to update document!`);
		return successResponse(res, `Document updated successfully`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

// delete document
const deleteDocument = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	try {
		const checkDocument = await DB.documents.findOne({ where: { id, candidateId: req.candidate.id } });
		if (!checkDocument) return errorResponse(res, `Document with ID ${id} not found!`);
		await checkDocument.destroy({ force: true });
		return successResponse(res, `Document with ID ${id} deleted successfully!`);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

export default {
	createDocument,
	getDocuments,
	getDocumentDetails,
	updateDocument,
	deleteDocument,
};
