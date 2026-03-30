package com.fyp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Configure Spring Boot to serve the Angular SPA index.html
 * for any route that doesn't match an API endpoint or existing static file.
 */
@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
      registry.addResourceHandler("/**")
        .addResourceLocations("classpath:/static/")
        .resourceChain(true)
        .addResolver(new PathResourceResolver() {
            @Override
            protected Resource getResource(String resourcePath, Resource location) throws IOException {
                Resource requestedResource = location.createRelative(resourcePath);
                // If the requested resource exists (e.g. standard file), serve it
                if (requestedResource.exists() && requestedResource.isReadable()) {
                    return requestedResource;
                }
                // Otherwise, if not an API request, serve index.html to allow Angular to handle routing
                if (resourcePath.startsWith("api/")) {
                    return null; // Return null so Spring MVC handles 404 natively
                }
                return new ClassPathResource("/static/index.html");
            }
        });
    }
}
