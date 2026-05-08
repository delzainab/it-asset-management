package com.example.itasset.config;

import com.example.itasset.model.Office;
import com.example.itasset.model.Department;
import com.example.itasset.repository.OfficeRepository;
import com.example.itasset.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private OfficeRepository officeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;
    @Override
    public void run(String... args) throws Exception {
        if (officeRepository.count() == 0) {
            Office office1 = new Office();
            office1.setName("Bureau 101");
            office1.setFloor("1er étage");
            office1.setBuilding("Bâtiment A");
            office1.setSite("Site Principal");
            officeRepository.save(office1);

            Office office2 = new Office();
            office2.setName("Bureau 202");
            office2.setFloor("2ème étage");
            office2.setBuilding("Bâtiment B");
            office2.setSite("Site Secondaire");
            officeRepository.save(office2);

            System.out.println("✅ Bureaux créés");
        }
        if (departmentRepository.count() == 0) {
            Department dept1 = new Department();
            dept1.setName("Informatique");
            dept1.setDescription("Service informatique");
            departmentRepository.save(dept1);

            Department dept2 = new Department();
            dept2.setName("Ressources Humaines");
            dept2.setDescription("Service RH");
            departmentRepository.save(dept2);

            Department dept3 = new Department();
            dept3.setName("Comptabilité");
            dept3.setDescription("Service comptable");
            departmentRepository.save(dept3);

            System.out.println("✅ Services créés");
        }
    }
}