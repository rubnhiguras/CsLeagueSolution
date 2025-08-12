package com.rhas.csleaguesolution.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
//import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
//import org.springframework.core.io.Resource;
//import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;
//import org.springframework.web.servlet.resource.*;
//
//import java.io.IOException;
//import java.io.InputStream;

@Configuration
public class SpringdocSwaggerFix implements WebMvcConfigurer {
    @Value("${app.avatar.upload-dir}")
    private String uploadDir;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API REST Gestión csleaguesolutions")
                        .version("1.0")
                        .license(new License().name("Apache 2.0")))
                .externalDocs(new ExternalDocumentation()
                        .description("Documentación completa de app gestión csleaguesolutions")
                        .url("/v3/api-docs"))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .name("bearerAuth")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/avatars/**")
                .addResourceLocations("file:" + uploadDir + "/")
                .setCachePeriod(3600)
                .resourceChain(true)
                .addResolver(new PathResourceResolver());
    }

//    @Override
//    public void addResourceHandlers(ResourceHandlerRegistry registry) {
//        registry.addResourceHandler("/**/*.html")
//                .addResourceLocations("classpath:/META-INF/resources/webjars/")
//                .resourceChain(false)
//                .addResolver(new WebJarsResourceResolver())
//                .addResolver(new PathResourceResolver())
//                .addTransformer(new IndexPageTransformer());
//    }
//
//    public class IndexPageTransformer implements ResourceTransformer {
//        @Override
//        public Resource transform(HttpServletRequest request, Resource resource,
//                                  ResourceTransformerChain transformerChain) throws IOException {
//            if (resource.getURL().toString().endsWith("/index.html")) {
//                String html = getHtmlContent(resource);
//                html = overwritePetStore(html);
//                return new TransformedResource(resource, html.getBytes());
//            } else {
//                return resource;
//            }
//        }
//
//        private String overwritePetStore(String html) {
//            return html.replace("https://petstore.swagger.io/v2/swagger.json",
//                    "/v3/api-docs");
//        }
//
//        private String getHtmlContent( Resource resource) {
//            try {
//                InputStream inputStream = resource.getInputStream();
//                java.util.Scanner s = new java.util.Scanner(inputStream).useDelimiter("\\A");
//                String content = s.next();
//                inputStream.close();
//                return content;
//            } catch (IOException e) {
//                throw new RuntimeException(e);
//            }
//        }
//    }
}