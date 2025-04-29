package edu.eci.arep.springPropertyManagement.controller;

import edu.eci.arep.springPropertyManagement.model.Property;
import edu.eci.arep.springPropertyManagement.service.PropertyService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService service;

    public PropertyController(PropertyService service) {
        this.service = service;
    }

    @GetMapping
    public List<Property> getAll() {
        return service.getAllProperties();
    }

    @GetMapping("/{id}")
    public Property getById(@PathVariable Long id) {
        return service.getPropertyById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
    }

    @PostMapping
    public Property create(@RequestBody Property property) {
        return service.createProperty(property);
    }

    @PutMapping("/{id}")
    public Property update(@PathVariable Long id, @RequestBody Property property) {
        return service.updateProperty(id, property);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteProperty(id);
    }

    @GetMapping("/search")
    public List<Property> searchProperties(
            @RequestParam(required = false) String address,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer minSize,
            @RequestParam(required = false) Integer maxSize) {
        return service.searchProperties(address, minPrice, maxPrice, minSize, maxSize);
    }
}
