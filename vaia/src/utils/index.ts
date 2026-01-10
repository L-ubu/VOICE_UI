import type { Ref } from 'vue'

export type ValidationRule<T = any> = (value: T, fieldName?: string) => string | null

export type ValidationRuleFactory<T = any> = (...args: any[]) => ValidationRule<T>

export interface FieldConfig<T = any> {
	value: () => T
	error: Ref<string>
	rules: ValidationRule<T>[]
	label: string
}

export interface FormData {
	title: Ref<string>
	titleError: Ref<string>
	introduction: Ref<string>
	introductionError: Ref<string>
	subtitle: Ref<string>
	subtitleError: Ref<string>
	description: Ref<string>
	descriptionError: Ref<string>
	courseLink: Ref<string>
	courseLinkError: Ref<string>
	courseType: Ref<string>
	courseTypeError: Ref<string>

	startDate: Ref<string>
	startDateError: Ref<string>
	endDate: Ref<string>
	endDateError: Ref<string>
	startTime: Ref<string>
	startTimeError: Ref<string>
	endTime: Ref<string>
	endTimeError: Ref<string>

	organisers: Ref<string[]>
	organisersError: Ref<string>
	PrimaryTargetGroup: Ref<string[]>
	PrimaryTargetGroupError: Ref<string>
	requirements: Ref<string>
	requirementsError: Ref<string>
	priceLevel: Ref<string []>
	priceLevelError: Ref<string>
	afterCourseGoals: Ref<string[]>
	afterCourseGoalsError: Ref<string>
	ethicDomains: Ref<string[]>
	ethicDomainsError: Ref<string>
	certificate: Ref<string []>
	certificateError: Ref<string>
	targetGroup: Ref<string>
	targetGroupError: Ref<string>
	exactPrice: Ref<string>
	exactPriceError: Ref<string>
	knowledgeLevel: Ref<string[]>
	knowledgeLevelError: Ref<string>
	scopeOfApplication: Ref<string[]>
	scopeOfApplicationError: Ref<string>
	language: Ref<string []>
	languageError: Ref<string>
	locationZone: Ref<string []>
	locationZoneError: Ref<string>
	locationAddress: Ref<string>
	locationAddressError: Ref<string>
	totalHours: Ref<string>
	totalHoursError: Ref<string>

	firstName: Ref<string>
	firstNameError: Ref<string>
	lastName: Ref<string>
	lastNameError: Ref<string>
	email: Ref<string>
	emailError: Ref<string>
	organisationName: Ref<string>
	organisationNameError: Ref<string>
}

export type FieldName = keyof Pick<FormData,
	'title' | 'introduction' | 'subtitle' | 'description' | 'courseLink' | 'courseType' |
	'startDate' | 'endDate' | 'startTime' | 'endTime' | 'organisers' | 'PrimaryTargetGroup' |
	'requirements' | 'priceLevel' | 'afterCourseGoals' | 'ethicDomains' | 'certificate' |
	'targetGroup' | 'exactPrice' | 'knowledgeLevel' | 'scopeOfApplication' | 'language' |
	'locationZone' | 'locationAddress' | 'totalHours' |
	'firstName' | 'lastName' | 'email' | 'organisationName'
>

export interface ValidationResult {
	isValid: boolean
	errors: FieldName[]
}

export interface FormValidator {
	validateField: (fieldName: FieldName) => boolean
	validateFields: (fieldNames: FieldName[]) => ValidationResult
	validateAllFields: () => ValidationResult
	clearAllErrors: () => void
	clearFieldError: (fieldName: FieldName) => void
	setupRealtimeValidation: () => Record<FieldName, (value: any) => void>
	fieldConfig: Record<FieldName, FieldConfig>
}

export const validationRules = {
	required: <T>(value: T, fieldName = 'Dit veld'): string | null => {
		if (value === null || value === undefined || value === '' ||
			(Array.isArray(value) && value.length === 0)) {
			return `${fieldName} is verplicht`
		}
		return null
	},

	url: (value: string): string | null => {
		if (!value) return null
		try {
			new URL(value)
			return null
		} catch {
			return 'Ongeldige URL'
		}
	},

	email: (value: string): string | null => {
        if (!value) return null;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? null : 'Ongeldige email';
    },

	maxLength: (max: number): ValidationRule<string> => (value: string): string | null => {
		if (value && value.length > max) {
			return `Maximum ${max} karakters toegestaan`
		}
		return null
	},

	minLength: (min: number): ValidationRule<string> => (value: string): string | null => {
		if (value && value.length < min) {
			return `Minimum ${min} karakters vereist`
		}
		return null
	},

	number: (value: string): string | null => {
		if (value && isNaN(parseFloat(value))) {
			return 'Moet een geldig nummer zijn'
		}
		return null
	},

	positiveNumber: (value: string): string | null => {
		if (value && (isNaN(parseFloat(value)) || parseFloat(value) < 0)) {
			return 'Moet een positief nummer zijn'
		}
		return null
	},

	minArrayLength: (min: number): ValidationRule<any[]> => (value: any[]): string | null => {
		if (!Array.isArray(value) || value.length < min) {
			return `Selecteer minimum ${min} optie${min > 1 ? 's' : ''}`
		}
		return null
	},

	dateNotInPast: (value: string): string | null => {
		if (!value) return null

		const today = new Date()
		today.setHours(0, 0, 0, 0)

		const inputDate = new Date(value)
		if (inputDate < today) {
			return 'Datum mag niet in het verleden liggen'
		}
		return null
	},


	dateAfter: (getCompareDate: () => string): ValidationRule<string> => (value: string): string | null => {
		const compareDate = getCompareDate();
		if (!value || !compareDate) return null;

		if (new Date(value) < new Date(compareDate)) {
			return 'Datum moet na de startdatum liggen';
		}
		return null;
	},

	timeAfter: (getCompareTime: () => string): ValidationRule<string> => (value: string): string | null => {
		const compareTime = getCompareTime();
		if (!value || !compareTime) return null;

		if (value < compareTime) {
			return 'Tijd moet na de starttijd liggen';
		}
		return null;
	},

	noEmojis: (value: string): string | null => {
		if (value && /[\uD800-\uDFFF]/.test(value)) {
			return 'Emoji\'s zijn niet toegestaan'
		}
		return null
	}


} as const

export const createFieldConfig = (formData: FormData): Record<FieldName, FieldConfig> => ({
	title: {
		value: () => formData.title.value,
		error: formData.titleError,
		rules: [validationRules.required, validationRules.noEmojis],
		label: 'Titel'
	},

	introduction: {
		value: () => formData.introduction.value,
		error: formData.introductionError,
		rules: [validationRules.required, validationRules.maxLength(500)],
		label: 'Inleiding'
	},

	subtitle: {
		value: () => formData.subtitle.value,
		error: formData.subtitleError,
		rules: [validationRules.required],
		label: 'Ondertitel'
	},

	description: {
		value: () => formData.description.value,
		error: formData.descriptionError,
		rules: [],
		label: 'Beschrijving'
	},

	courseLink: {
		value: () => formData.courseLink.value,
		error: formData.courseLinkError,
		rules: [validationRules.required, validationRules.url],
		label: 'Link naar inschrijving'
	},

	courseType: {
		value: () => formData.courseType.value,
		error: formData.courseTypeError,
		rules: [validationRules.required],
		label: 'Type opleiding'
	},

	startDate: {
		value: () => formData.startDate.value,
		error: formData.startDateError,
		rules: formData.courseType.value === 'Deze opleiding gaat door op een bepaalde datum of over een bepaalde periode.' ? [validationRules.required, validationRules.dateNotInPast] : [],
		label: 'Startdatum'
	},

	endDate: {
		value: () => formData.endDate.value,
		error: formData.endDateError,
		rules: formData.courseType.value === 'Deze opleiding gaat door op een bepaalde datum of over een bepaalde periode.' ? [validationRules.required, validationRules.dateAfter(() => formData.startDate.value)] : [],
		label: 'Einddatum'
	},

	startTime: {
		value: () => formData.startTime.value,
		error: formData.startTimeError,
		rules: [],
		label: 'Starttijd'
	},

	endTime: {
		value: () => formData.endTime.value,
		error: formData.endTimeError,
		rules: [validationRules.timeAfter(() => formData.startTime.value)],
		label: 'Eindtijd'
	},

	organisers: {
		value: () => formData.organisers.value,
		error: formData.organisersError,
		rules: [validationRules.minArrayLength(1)],
		label: 'Organisatoren'
	},

	PrimaryTargetGroup: {
		value: () => formData.PrimaryTargetGroup.value,
		error: formData.PrimaryTargetGroupError,
		rules: [validationRules.minArrayLength(1)],
		label: 'Primaire doelgroep'
	},

	requirements: {
		value: () => formData.requirements.value,
		error: formData.requirementsError,
		rules: [validationRules.required],
		label: 'Vereisten'
	},

	priceLevel: {
		value: () => formData.priceLevel.value,
		error: formData.priceLevelError,
		rules: [validationRules.required],
		label: 'Prijsniveau'
	},

	afterCourseGoals: {
		value: () => formData.afterCourseGoals.value,
		error: formData.afterCourseGoalsError,
		rules: [validationRules.minArrayLength(1)],
		label: 'Doelen na cursus'
	},

	ethicDomains: {
		value: () => formData.ethicDomains.value,
		error: formData.ethicDomainsError,
		rules: [],
		label: 'Ethische domeinen'
	},

	certificate: {
		value: () => formData.certificate.value,
		error: formData.certificateError,
		rules: [],
		label: 'Certificaat'
	},

	targetGroup: {
		value: () => formData.targetGroup.value,
		error: formData.targetGroupError,
		rules: [validationRules.required, validationRules.maxLength(125)],
		label: 'Doelgroep'
	},

	exactPrice: {
		value: () => formData.exactPrice.value,
		error: formData.exactPriceError,
		rules: [validationRules.required, validationRules.positiveNumber],
		label: 'Exacte prijs'
	},

	knowledgeLevel: {
		value: () => formData.knowledgeLevel.value,
		error: formData.knowledgeLevelError,
		rules: [validationRules.minArrayLength(1)],
		label: 'Prijs'
	},

	scopeOfApplication: {
		value: () => formData.scopeOfApplication.value,
		error: formData.scopeOfApplicationError,
		rules: [validationRules.minArrayLength(1)],
		label: 'Toepassingsgebied'
	},

	language: {
		value: () => formData.language.value,
		error: formData.languageError,
		rules: [validationRules.required],
		label: 'Taal'
	},

	locationZone: {
		value: () => formData.locationZone.value,
		error: formData.locationZoneError,
		rules: [validationRules.required],
		label: 'Locatie zone'
	},

	locationAddress: {
		value: () => formData.locationAddress.value,
		error: formData.locationAddressError,
		rules: [validationRules.required],
		label: 'Locatie adres'
	},

	totalHours: {
		value: () => formData.totalHours.value,
		error: formData.totalHoursError,
		rules: [validationRules.required, validationRules.positiveNumber],
		label: 'Totaal aantal uren'
	},

	firstName: {
		value: () => formData.firstName.value,
		error: formData.firstNameError,
		rules: [validationRules.required],
		label: 'Voornaam'
	},

	lastName: {
		value: () => formData.lastName.value,
		error: formData.lastNameError,
		rules: [validationRules.required],
		label: 'Achternaam'
	},

	email: {
		value: () => formData.email.value,
		error: formData.emailError,
		rules: [validationRules.required, validationRules.email],
		label: 'Email'
	},
	
	organisationName: {
		value: () => formData.organisationName.value,
		error: formData.organisationNameError,
		rules: [validationRules.required],
		label: 'Organisatie'
	}
})

export const useFormValidator = (formData: FormData): FormValidator => {
	const fieldConfig = createFieldConfig(formData)

	const validateField = (fieldName: FieldName): boolean => {
		const field = fieldConfig[fieldName]
		if (!field) {
			console.warn(`Field ${fieldName} not found in configuration`)
			return true
		}

		const value = field.value()

		field.error.value = ''

		for (const rule of field.rules) {
			const error = rule(value, field.label)
			if (error) {
				field.error.value = error
				return false
			}
		}

		return true
	}

	const validateAllFields = (): ValidationResult => {
		let isValid = true
		const errors: FieldName[] = [];

			(Object.keys(fieldConfig) as FieldName[]).forEach(fieldName => {
				const fieldValid = validateField(fieldName)
				if (!fieldValid) {
					isValid = false
					errors.push(fieldName)
				}
			})

		return { isValid, errors }
	}

	const validateFields = (fieldNames: FieldName[]): ValidationResult => {
		let isValid = true
		const errors: FieldName[] = [];

		fieldNames.forEach(fieldName => {
			const fieldValid = validateField(fieldName)
			if (!fieldValid) {
				isValid = false
				errors.push(fieldName)
			}
		})

		return { isValid, errors }
	}

	const clearAllErrors = (): void => {
		Object.values(fieldConfig).forEach(field => {
			field.error.value = ''
		})
	}

	const clearFieldError = (fieldName: FieldName): void => {
		const field = fieldConfig[fieldName]
		if (field) {
			field.error.value = ''
		}
	}

	const setupRealtimeValidation = (): Record<FieldName, (value: any) => void> => {
		const validators = {} as Record<FieldName, (value: any) => void>

		(Object.keys(fieldConfig) as FieldName[]).forEach(fieldName => {
			validators[fieldName] = (newValue: any) => {
				if (fieldConfig[fieldName].error.value) {
					validateField(fieldName)
				}
			}
		})

		return validators
	}

	return {
		validateField,
		validateFields,
		validateAllFields,
		clearAllErrors,
		clearFieldError,
		setupRealtimeValidation,
		fieldConfig
	}
}

import { ref } from 'vue'

export const useFormData = (): FormData => {
	return {
		title: ref<string>(''),
		titleError: ref<string>(''),

		introduction: ref<string>(''),
		introductionError: ref<string>(''),

		subtitle: ref<string>(''),
		subtitleError: ref<string>(''),

		description: ref<string>(''),
		descriptionError: ref<string>(''),

		courseLink: ref<string>(''),
		courseLinkError: ref<string>(''),

		courseType: ref<string>(''),
		courseTypeError: ref<string>(''),

		startDate: ref<string>(''),
		startDateError: ref<string>(''),
		
		endDate: ref<string>(''),
		endDateError: ref<string>(''),

		startTime: ref<string>(''),
		startTimeError: ref<string>(''),

		endTime: ref<string>(''),
		endTimeError: ref<string>(''),

		organisers: ref<string[]>([]),
		organisersError: ref<string>(''),

		PrimaryTargetGroup: ref<string[]>([]),
		PrimaryTargetGroupError: ref<string>(''),

		requirements: ref<string>(''),
		requirementsError: ref<string>(''),

		priceLevel:  ref<string []>([]),
		priceLevelError: ref<string>(''),

		afterCourseGoals: ref<string[]>([]),
		afterCourseGoalsError: ref<string>(''),

		ethicDomains: ref<string[]>([]),
		ethicDomainsError: ref<string>(''),

		certificate: ref<string []>([]),
		certificateError: ref<string>(''),
		
		targetGroup: ref<string>(''),
		targetGroupError: ref<string>(''),

		exactPrice: ref<string>(''),
		exactPriceError: ref<string>(''),

		knowledgeLevel: ref<string[]>([]),
		knowledgeLevelError: ref<string>(''),

		scopeOfApplication: ref<string[]>([]),
		scopeOfApplicationError: ref<string>(''),

		language: ref<string []>([]),
		languageError: ref<string>(''),

		locationZone: ref<string []>([]),
		locationZoneError: ref<string>(''),

		locationAddress: ref<string>(''),
		locationAddressError: ref<string>(''),

		totalHours: ref<string>(''),
		totalHoursError: ref<string>(''),

		firstName: ref<string>(''),
		firstNameError: ref<string>(''),

		lastName: ref<string>(''),
		lastNameError: ref<string>(''),

		email: ref<string>(''),
		emailError: ref<string>(''),

		organisationName: ref<string>(''),
		organisationNameError: ref<string>(''),
	}
}

export const resetFormData = (formData: FormData) => {
	for (const key in formData) {
		const refValue = formData[key as keyof FormData];
		if (Array.isArray(refValue.value)) {
			refValue.value = [];
		} else {
			refValue.value = '';
		}
	}
}
