const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  filenameHashing: true,
  transpileDependencies: true,
  css: {
    loaderOptions: {
      sass: { 
        additionalData: `
          @import "@/assets/scss/main.scss";
        `
      }
    }
  },
});
