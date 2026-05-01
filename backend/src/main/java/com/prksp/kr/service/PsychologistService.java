package com.prksp.kr.service;

import com.prksp.kr.dto.request.CreateServiceRequest;
import com.prksp.kr.dto.request.UpdateProfileRequest;
import com.prksp.kr.dto.response.PsychologistResponse;
import com.prksp.kr.dto.response.ServiceResponse;
import com.prksp.kr.entity.PsychologistProfile;
import com.prksp.kr.entity.User;
import com.prksp.kr.entity.UserRole;
import com.prksp.kr.repository.PsychologistProfileRepository;
import com.prksp.kr.repository.PsychologistServiceRepository;
import com.prksp.kr.repository.ReviewRepository;
import com.prksp.kr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PsychologistService {

    private final UserRepository userRepository;
    private final PsychologistProfileRepository profileRepository;
    private final PsychologistServiceRepository serviceRepository;
    private final ReviewRepository reviewRepository;

    public List<PsychologistResponse> getAllPsychologists(String search) {
        List<User> psychologists = userRepository.findByRole(UserRole.PSYCHOLOGIST);

        if (search != null && !search.isBlank()) {
            String lower = search.toLowerCase();
            psychologists = psychologists.stream()
                    .filter(p -> p.getFirstName().toLowerCase().contains(lower)
                            || p.getLastName().toLowerCase().contains(lower)
                            || p.getEmail().toLowerCase().contains(lower))
                    .collect(Collectors.toList());
        }

        return psychologists.stream()
                .map(this::toPsychologistResponse)
                .collect(Collectors.toList());
    }

    public PsychologistResponse getPsychologistById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Psychologist not found"));
        if (user.getRole() != UserRole.PSYCHOLOGIST) {
            throw new IllegalArgumentException("User is not a psychologist");
        }
        return toPsychologistResponse(user);
    }

    @Transactional
    public PsychologistResponse updateProfile(User currentUser, UpdateProfileRequest request) {
        PsychologistProfile profile = profileRepository.findByUser(currentUser)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getEducation() != null) profile.setEducation(request.getEducation());
        if (request.getExperienceYears() != null) profile.setExperienceYears(request.getExperienceYears());
        if (request.getPhotoUrl() != null) profile.setPhotoUrl(request.getPhotoUrl());

        profileRepository.save(profile);
        return toPsychologistResponse(currentUser);
    }

    public List<ServiceResponse> getServices(UUID psychologistId) {
        User psychologist = userRepository.findById(psychologistId)
                .orElseThrow(() -> new IllegalArgumentException("Psychologist not found"));
        return serviceRepository.findByPsychologistAndIsActiveTrue(psychologist).stream()
                .map(this::toServiceResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ServiceResponse createService(User psychologist, CreateServiceRequest request) {
        com.prksp.kr.entity.PsychologistService service = com.prksp.kr.entity.PsychologistService.builder()
                .psychologist(psychologist)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .durationMinutes(request.getDurationMinutes())
                .build();

        return toServiceResponse(serviceRepository.save(service));
    }

    @Transactional
    public void deleteService(User psychologist, UUID serviceId) {
        com.prksp.kr.entity.PsychologistService service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new IllegalArgumentException("Service not found"));
        if (!service.getPsychologist().getId().equals(psychologist.getId())) {
            throw new AccessDeniedException("Not allowed");
        }
        service.setIsActive(false);
        serviceRepository.save(service);
    }

    private PsychologistResponse toPsychologistResponse(User user) {
        PsychologistProfile profile = profileRepository.findByUser(user).orElse(null);
        Double avgRating = reviewRepository.findAverageRatingByPsychologist(user);
        List<?> reviews = reviewRepository.findByPsychologistOrderByCreatedAtDesc(user);

        return PsychologistResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .bio(profile != null ? profile.getBio() : null)
                .education(profile != null ? profile.getEducation() : null)
                .experienceYears(profile != null ? profile.getExperienceYears() : null)
                .photoUrl(profile != null ? profile.getPhotoUrl() : null)
                .isVerified(profile != null ? profile.getIsVerified() : false)
                .averageRating(avgRating)
                .reviewCount(reviews.size())
                .build();
    }

    private ServiceResponse toServiceResponse(com.prksp.kr.entity.PsychologistService service) {
        return ServiceResponse.builder()
                .id(service.getId())
                .psychologistId(service.getPsychologist().getId())
                .psychologistName(service.getPsychologist().getFirstName() + " " + service.getPsychologist().getLastName())
                .name(service.getName())
                .description(service.getDescription())
                .price(service.getPrice())
                .durationMinutes(service.getDurationMinutes())
                .isActive(service.getIsActive())
                .build();
    }
}
