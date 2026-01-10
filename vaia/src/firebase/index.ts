import { db } from '@/firebase/firebase-config';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { FormData } from '@/utils'
import type { FirebaseError } from 'firebase/app';

export const storeInfto = async ( formData: FormData) => {
	try {
		const colRef = collection(db, "course_registrations");
		await setDoc(doc(colRef), {
			title: formData.title.value,
			introduction: formData.introduction.value,
			subtitle: formData.subtitle.value,
			description: formData.description.value,
			courseLink: formData.courseLink.value,
			courseType: formData.courseType.value,
			startDate: formData.startDate.value,
			endDate: formData.endDate.value,
			startTime: formData.startTime.value,
			endTime: formData.endTime.value,
			requirements: formData.requirements.value,
			priceLevel: formData.priceLevel.value,
			afterCourseGoals: formData.afterCourseGoals.value,
			ethicDomains: formData.ethicDomains.value,
			certificate: formData.certificate.value,
			locationAddress: formData.locationAddress.value,
			targetGroup: formData.targetGroup.value,
			exactPrice: formData.exactPrice.value,
			knowledgeLevel: formData.knowledgeLevel.value,
			scopeOfApplication: formData.scopeOfApplication.value,
			language: formData.language.value,
			locationZone: formData.locationZone.value,
			totalHours: formData.totalHours.value,

			created_at: serverTimestamp()
		});
	}
	catch (error: FirebaseError | any) {
		throw new Error(error);	
	}	
};