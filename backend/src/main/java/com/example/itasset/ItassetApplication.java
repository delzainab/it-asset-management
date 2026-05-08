package com.example.itasset;

import com.example.itasset.model.Role;
import com.example.itasset.model.User;
import com.example.itasset.repository.RoleRepository;
import com.example.itasset.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class ItassetApplication implements CommandLineRunner {

	@Autowired
	private RoleRepository roleRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	public static void main(String[] args) {
		SpringApplication.run(ItassetApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		// Créer les rôles par défaut
		if (roleRepository.count() == 0) {
			roleRepository.save(new Role("ADMIN"));
			roleRepository.save(new Role("TECHNICIEN"));
			roleRepository.save(new Role("CONSULTATION"));
			System.out.println("✅ Rôles créés: ADMIN, TECHNICIEN, CONSULTATION");
		}

		if (!userRepository.existsByEmail("admin@prefecture.ma")) {
			User admin = new User();
			admin.setFullName("Administrateur");
			admin.setEmail("admin@prefecture.ma");
			admin.setPassword(passwordEncoder.encode("admin123"));
			admin.setRole(roleRepository.findByName("ADMIN").get());
			admin.setActive(true);
			userRepository.save(admin);
			System.out.println("✅ Admin créé:");
			System.out.println("   Email: admin@prefecture.ma");
			System.out.println("   Mot de passe: admin123");
		}
	}
}