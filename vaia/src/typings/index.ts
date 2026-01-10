export interface InputFieldProps {
	id: string;
	label: string;
    suggestions?: string[] | null;
	type?: 'text' | 'date' | 'time' | 'number';
	required: boolean;
	error: string | null;
	className?: string;
	autofill?: boolean;
}

export interface InputFieldTextProps extends InputFieldProps {
	modelValue: string;
	placeholder?: string;
}
export interface InputFieldCheckboxProps extends InputFieldProps {
	modelValue: string[];
	options: {
		label: string;
		value: string;
	}[];
}

export interface InputFieldRadioProps extends InputFieldProps {
	modelValue: string;
	options: {
		label: string;
		value: string;
	}[];
}

export interface InputFieldDropdownSelectProps extends InputFieldProps {
	modelValue: string[];
    multiple: boolean;
	options: InputFieldDropdownSelectOptions[];
}

export interface InputFieldDropdownSelectOptions {
	group_name: string;
	options: string[];
}


export interface OpenAiResponse {
	title: string [] | null;
	introduction: string [] | null;
	subtitle: string [] | null;
	description: string [] | null;
	courseLink: string [] | null;
	courseType: string [] | null;
	startDate: string [] | null;
	endDate: string [] | null;
	startTime: string [] | null;
	endTime: string [] | null;

	requirements: string [];
	priceLevel: string [] | null;
	afterCourseGoals: string [] | null;
	ethicDomains: string [] | null;
	certificate: string [] | null;
	locationAddress: string [] | null;

	targetGroup: string [] | null;
	exactPrice: string [] | null;
	knowledgeLevel: string [] | null;
	scopeOfApplication: string [] | null;
	language: string [] | null;
	locationZone: string [] | null;
	totalHours: string [] | null;
}