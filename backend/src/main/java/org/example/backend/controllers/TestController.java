package org.example.backend.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("")
public class TestController {
    @RequestMapping("/test")
    public String test() {
        return "Test successful!";
    }
    @RequestMapping("")
    public String test2() {
        return "Backend is running!";
    }
}
