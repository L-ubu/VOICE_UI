
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import CKEditor from '@ckeditor/ckeditor5-vue';
import ToastPlugin from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(CKEditor)
app.use(ToastPlugin, {
	position: 'top',
});

app.mount('#app')
