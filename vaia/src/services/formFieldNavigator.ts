export type FormStep = 1 | 2;

export type FieldKey =
	| 'title'
	| 'introduction'
	| 'subtitle'
	| 'description'
	| 'courseLink'
	| 'courseType'
	| 'startDate'
	| 'endDate'
	| 'startTime'
	| 'endTime'
	| 'organisers'
	| 'PrimaryTargetGroup'
	| 'targetGroup'
	| 'knowledgeLevel'
	| 'requirements'
	| 'priceLevel'
	| 'exactPrice'
	| 'afterCourseGoals'
	| 'scopeOfApplication'
	| 'ethicDomains'
	| 'certificate'
	| 'language'
	| 'totalHours'
	| 'locationZone'
	| 'locationAddress'
	| 'firstName'
	| 'lastName'
	| 'email'
	| 'organisationName';

const STEP_1_ORDER: FieldKey[] = [
	'title', 'introduction', 'subtitle', 'description', 'courseLink', 'courseType',
	'startDate', 'endDate', 'startTime', 'endTime'
];

const STEP_2_ORDER: FieldKey[] = [
	'organisers', 'PrimaryTargetGroup', 'targetGroup', 'knowledgeLevel', 'requirements',
	'priceLevel', 'exactPrice', 'afterCourseGoals', 'scopeOfApplication', 'ethicDomains',
	'certificate', 'language', 'totalHours', 'locationZone', 'locationAddress',
	'firstName', 'lastName', 'email', 'organisationName'
];

export type FocusMoveResult = {
	from: FieldKey | null;
	to: FieldKey | null;
	atEdge?: 'start' | 'end';
};

const isVisible = (el: HTMLElement): boolean => {
	const style = window.getComputedStyle(el);
	if (style.display === 'none' || style.visibility === 'hidden') return false;
	if (el.offsetParent === null) return false;
	const rect = el.getBoundingClientRect();
	return rect.width > 0 && rect.height > 0;
};

export const getActiveFieldKey = (): FieldKey | null => {
	const active = document.activeElement as HTMLElement | null;
	if (!active) return null;

	// Check if we're in a dropdown container
	const dropdownContainer = active.closest('.dropdown-container') as HTMLElement | null;
	if (dropdownContainer?.id) return dropdownContainer.id as FieldKey;

	// Check if there's an open dropdown menu (user might be interacting with it)
	const openDropdownMenu = document.querySelector('.dropdown-menu[style*="display: block"], .dropdown-header.open');
	if (openDropdownMenu) {
		const container = openDropdownMenu.closest('.dropdown-container') as HTMLElement | null;
		if (container?.id) return container.id as FieldKey;
	}

	// Check if organisers popup is open
	const organisersPopup = document.querySelector('.organisers-popup.open');
	if (organisersPopup) return 'organisers';

	// Handle checkbox fields
	if (active instanceof HTMLInputElement) {
		if (active.type === 'checkbox' && (active.name === 'PrimaryTargetGroup' || active.id.startsWith('PrimaryTargetGroup'))) {
			return 'PrimaryTargetGroup';
		}
		if (active.type === 'radio' && (active.name === 'courseType' || active.id.startsWith('courseType'))) {
			return 'courseType';
		}
	}

	// Handle rich text editor
	if (active.classList.contains('ck-editor__editable')) return 'description';
	
	// Direct ID match
	if (active.id && isValidFieldKey(active.id)) return active.id as FieldKey;
	
	return null;
};

// Helper to validate if a string is a valid FieldKey
const isValidFieldKey = (id: string): id is FieldKey => {
	const allKeys: string[] = [
		'title', 'introduction', 'subtitle', 'description', 'courseLink', 'courseType',
		'startDate', 'endDate', 'startTime', 'endTime', 'organisers', 'PrimaryTargetGroup',
		'targetGroup', 'knowledgeLevel', 'requirements', 'priceLevel', 'exactPrice',
		'afterCourseGoals', 'scopeOfApplication', 'ethicDomains', 'certificate', 'language',
		'totalHours', 'locationZone', 'locationAddress', 'firstName', 'lastName', 'email', 'organisationName'
	];
	return allKeys.includes(id);
};

// Dropdown field IDs on step 2
const DROPDOWN_FIELDS: FieldKey[] = [
	'organisers', 'knowledgeLevel', 'priceLevel', 'afterCourseGoals', 
	'scopeOfApplication', 'ethicDomains', 'certificate', 'language', 'locationZone'
];

export const resolveFieldElement = (key: FieldKey): HTMLElement | null => {
	// Try direct ID lookup first
	const byId = document.getElementById(key);
	if (byId) {
		// If it's an input/textarea, return it
		if (byId.tagName === 'INPUT' || byId.tagName === 'TEXTAREA') {
			return byId;
		}
	}

	// Handle radio buttons (courseType)
	if (key === 'courseType') {
		return (document.getElementById('courseType-0') ||
			document.querySelector('input[type="radio"][name="courseType"]')) as HTMLElement | null;
	}

	// Handle checkboxes (PrimaryTargetGroup)
	if (key === 'PrimaryTargetGroup') {
		return (document.getElementById('PrimaryTargetGroup-0') ||
			document.querySelector('input[type="checkbox"][name="PrimaryTargetGroup"]')) as HTMLElement | null;
	}

	// Handle rich text editor (description)
	if (key === 'description') {
		const inputField = document.querySelector('.input-field:has(label[for="description"])') as HTMLElement | null;
		return inputField?.querySelector('.ck-editor__editable') as HTMLElement | null;
	}

	// Handle dropdown fields - look for dropdown container with matching ID
	if (DROPDOWN_FIELDS.includes(key)) {
		const dropdown = document.querySelector(`.dropdown-container#${CSS.escape(key)}`) as HTMLElement | null;
		if (dropdown) {
			// Return the dropdown header for focusing
			const header = dropdown.querySelector('.dropdown-header') as HTMLElement | null;
			return header || dropdown;
		}
	}

	// Generic dropdown lookup
	const dropdown = document.querySelector(`.dropdown-container#${CSS.escape(key)}`) as HTMLElement | null;
	if (dropdown) {
		return (dropdown.querySelector('.dropdown-header') || dropdown) as HTMLElement | null;
	}

	return byId;
};

// Close all open dropdowns and popups
const closeAllDropdowns = (): void => {
	// Close organisers popup
	const popup = document.querySelector('.organisers-popup.open');
	if (popup) {
		const btn = popup.querySelector('.done-button, .close-button') as HTMLElement;
		btn?.click();
	}
	
	// Close all open dropdown headers
	const openHeaders = document.querySelectorAll('.dropdown-header.open');
	openHeaders.forEach(header => {
		(header as HTMLElement).click();
	});
};

const focusFieldElement = (key: FieldKey, el: HTMLElement): void => {
	// First, close any open dropdowns/popups
	closeAllDropdowns();
	
	// Small delay to let dropdowns close before focusing new element
	setTimeout(() => {
		el.scrollIntoView({ behavior: 'smooth', block: 'center' });

		const dropdownContainer = el.closest('.dropdown-container') as HTMLElement | null;
		
		if (dropdownContainer) {
			// For dropdown fields, focus the filter input if available
			const filterInput = dropdownContainer.querySelector('input.filter') as HTMLElement | null;
			if (filterInput) {
				filterInput.focus();
			} else {
				el.focus?.();
			}
			
			// For organisers (uses popup), click to open
			if (dropdownContainer.id === 'organisers') {
				const isPopupOpen = document.querySelector('.organisers-popup.open');
				if (!isPopupOpen) {
					const header = dropdownContainer.querySelector('.dropdown-header') as HTMLElement;
					if (header) setTimeout(() => header.click(), 100);
				}
			} else {
				// For regular dropdowns, click to open the menu
				const header = dropdownContainer.querySelector('.dropdown-header') as HTMLElement;
				const isOpen = header?.classList.contains('open');
				if (header && !isOpen) {
					setTimeout(() => header.click(), 100);
				}
			}
		} else {
			el.focus?.();
		}
	}, 50);
};

export const getOrderedVisibleKeys = (step: FormStep): FieldKey[] => {
	const order = step === 1 ? STEP_1_ORDER : STEP_2_ORDER;
	return order.filter(key => {
		const el = resolveFieldElement(key);
		return !!el && isVisible(el);
	});
};

export const focusFirstFieldInStep = (step: FormStep): FieldKey | null => {
	const keys = getOrderedVisibleKeys(step);
	if (!keys.length) return null;
	const el = resolveFieldElement(keys[0]);
	if (!el) return null;
	focusFieldElement(keys[0], el);
	return keys[0];
};

export const focusNextFieldInStep = (step: FormStep, direction: 1 | -1): FocusMoveResult => {
	const keys = getOrderedVisibleKeys(step);
	const from = getActiveFieldKey();
	if (!keys.length) return { from, to: null };

	const currentIndex = from ? keys.indexOf(from) : -1;
	const safeIndex = currentIndex === -1 ? 0 : currentIndex;
	const nextIndex = direction === 1 ? safeIndex + 1 : safeIndex - 1;

	if (nextIndex >= keys.length) return { from, to: null, atEdge: 'end' };
	if (nextIndex < 0) return { from, to: null, atEdge: 'start' };

	const to = keys[nextIndex];
	const el = resolveFieldElement(to);
	if (!el) return { from, to: null };

	focusFieldElement(to, el);
	return { from, to };
};
