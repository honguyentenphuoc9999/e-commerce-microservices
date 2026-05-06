package com.rainbowforest.notificationservice.controller;

import com.rainbowforest.notificationservice.entity.SystemConfig;
import com.rainbowforest.notificationservice.repository.SystemConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/configs")
public class SystemConfigController {

    @Autowired
    private SystemConfigRepository configRepository;

    @GetMapping
    public List<SystemConfig> getAllConfigs() {
        return configRepository.findAll();
    }

    @PostMapping("/batch")
    public ResponseEntity<?> updateConfigs(@RequestBody Map<String, String> configs) {
        configs.forEach((key, value) -> {
            SystemConfig config = configRepository.findById(key).orElse(new SystemConfig(key, value, "Auto-generated"));
            config.setConfigValue(value);
            configRepository.save(config);
        });
        return ResponseEntity.ok("Configs updated successfully");
    }
    
    @GetMapping("/{key}")
    public ResponseEntity<SystemConfig> getConfig(@PathVariable String key) {
        return configRepository.findById(key)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
