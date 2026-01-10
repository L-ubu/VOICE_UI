import { defineStore } from "pinia";
import type { OpenAiResponse } from "@/typings";

export const useOpenaiResponseStore = defineStore("openaiResponse", {
	state: () => ({
		openaiResponse: null as OpenAiResponse | null,
	}),

	getters: {
		getOpenaiResponse: (state) => state.openaiResponse,
	},


	actions: {
		setOpenaiResponse(response: OpenAiResponse) {
			this.openaiResponse = response;
		},

		clearOpenaiResponse() {
			this.openaiResponse = null;
		},
	},
});