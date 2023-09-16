// Import packages
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

// Import db
import DB from './db';

// Import function files
import { handleResponse, successResponse, errorResponse } from '../helpers/utility';
import { VacancyDataType } from '../helpers/types';

// create vacancy
const createVacancy = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { name, description, closedAt } = req.body;
	const insertData: VacancyDataType = { name, description, closedAt };
	try {
		const vacancyExists: any = await DB.vacancies.findOne({
			where: { name },
			attributes: { exclude: ['createdAt', 'updatedAt'] },
		});
		// if vacancy exists, stop the process and return a message
		if (vacancyExists) return errorResponse(res, `vacancy with name ${name} already exists`);
		const vacancy: any = await DB.vacancies.create(insertData);
		if (vacancy) return successResponse(res, `Vacancy creation successfull`);
		return errorResponse(res, `An error occured`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

// get all vacancies
const getVacancies = async (req: Request, res: Response) => {
	try {
		const vacancies = await DB.vacancies.findAll({ order: [['id', 'DESC']] });
		if (!vacancies.length) return successResponse(res, `No vacancy available!`, []);
		return successResponse(res, `${vacancies.length} vacancy${vacancies.length > 1 ? 'es' : ''} retrived!`, vacancies);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

// get vacancy details
const getVacancyDetails = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	try {
		const vacancy = await DB.vacancies.findOne({
			where: { id },
			include: {
				model: DB.applications,
				include: { model: DB.candidates, attributes: { exclude: ['password'] }}
			}
		});
		if (!vacancy) return errorResponse(res, `Vacancy with ID ${id} not found!`);
		return successResponse(res, `Vacancy details retrived!`, vacancy);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

// update vacancy
const updateVacancy = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	const { name, description, closedAt } = req.body;
	try {
		const vacancy = await DB.vacancies.findOne({ where: { id }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
		if (!vacancy) return errorResponse(res, `vacancy not found!`);
		const updateData = {
			name: name || vacancy.name,
			description: description || vacancy.description,
			closedAt: closedAt || vacancy.closedAt,
		};
		const updatedVacancy: any = await vacancy.update(updateData);
		if (!updatedVacancy) return errorResponse(res, `Unable to update vacancy!`);
		return successResponse(res, `Vacancy updated successfully`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

// delete vacancy
const deleteVacancy = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	try {
		const checkVacancy = await DB.vacancies.findOne({ where: { id } });
		if (!checkVacancy) return errorResponse(res, `Vacancy with ID ${id} not found!`);
		await checkVacancy.destroy({ force: true });
		return successResponse(res, `Vacancy with ID ${id} deleted successfully!`);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

export default {
	createVacancy,
	getVacancies,
	getVacancyDetails,
	updateVacancy,
	deleteVacancy,
};
