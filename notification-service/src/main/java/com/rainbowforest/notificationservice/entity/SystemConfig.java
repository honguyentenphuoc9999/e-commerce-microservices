package com.rainbowforest.notificationservice.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "system_configs")
public class SystemConfig {
    @Id
    private String configKey;
    
    @Column(length = 500)
    private String configValue;
    
    private String description;

    // Default Constructor
    public SystemConfig() {}

    // All-args Constructor
    public SystemConfig(String configKey, String configValue, String description) {
        this.configKey = configKey;
        this.configValue = configValue;
        this.description = description;
    }

    // Getters and Setters
    public String getConfigKey() {
        return configKey;
    }

    public void setConfigKey(String configKey) {
        this.configKey = configKey;
    }

    public String getConfigValue() {
        return configValue;
    }

    public void setConfigValue(String configValue) {
        this.configValue = configValue;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
