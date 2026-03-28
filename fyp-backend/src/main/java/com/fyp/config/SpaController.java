package com.fyp.config;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Handles Angular SPA routing.
 *
 * How it works:
 * - GET /              → Spring serves index.html from static/ (default)
 * - GET /main.abc.js   → Spring serves the JS file from static/
 * - GET /api/**        → REST controllers handle it
 * - GET /student/dashboard → No match → 404 → this error handler →
 *                           forward to index.html → Angular handles routing
 */
@Controller
public class SpaController implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        // For 404 errors (unmatched Angular routes), serve index.html
        if (status != null && Integer.parseInt(status.toString()) == HttpStatus.NOT_FOUND.value()) {
            return "forward:/index.html";
        }
        // For other errors, also serve index.html (Angular will show error UI)
        return "forward:/index.html";
    }
}
