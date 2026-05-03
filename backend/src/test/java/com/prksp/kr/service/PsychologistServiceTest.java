package com.prksp.kr.service;

import com.prksp.kr.dto.request.UpdateProfileRequest;
import com.prksp.kr.dto.response.PsychologistResponse;
import com.prksp.kr.entity.PsychologistProfile;
import com.prksp.kr.entity.User;
import com.prksp.kr.entity.UserRole;
import com.prksp.kr.repository.PsychologistProfileRepository;
import com.prksp.kr.repository.PsychologistServiceRepository;
import com.prksp.kr.repository.ReviewRepository;
import com.prksp.kr.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PsychologistServiceTest {

    @Mock UserRepository userRepository;
    @Mock PsychologistProfileRepository profileRepository;
    @Mock PsychologistServiceRepository serviceRepository;
    @Mock ReviewRepository reviewRepository;

    @InjectMocks PsychologistService psychologistService;

    private User makeUser(UserRole role, String firstName, String lastName) {
        return User.builder()
                .id(UUID.randomUUID())
                .email(firstName.toLowerCase() + "@example.com")
                .firstName(firstName)
                .lastName(lastName)
                .role(role)
                .build();
    }

    private PsychologistProfile makeProfile(User user) {
        return PsychologistProfile.builder()
                .id(UUID.randomUUID())
                .user(user)
                .bio("Bio text")
                .education("MSU")
                .experienceYears(5)
                .isVerified(true)
                .build();
    }

    @Test
    void getAllPsychologists_returnsAll() {
        User p1 = makeUser(UserRole.PSYCHOLOGIST, "Anna", "Ivanova");
        User p2 = makeUser(UserRole.PSYCHOLOGIST, "Boris", "Petrov");

        when(userRepository.findByRole(UserRole.PSYCHOLOGIST)).thenReturn(List.of(p1, p2));
        when(profileRepository.findByUser(any())).thenReturn(Optional.empty());
        when(reviewRepository.findAverageRatingByPsychologist(any())).thenReturn(null);
        when(reviewRepository.findByPsychologistOrderByCreatedAtDesc(any())).thenReturn(Collections.emptyList());

        List<PsychologistResponse> result = psychologistService.getAllPsychologists(null);

        assertThat(result).hasSize(2);
    }

    @Test
    void getAllPsychologists_searchByName_filtersResults() {
        User p1 = makeUser(UserRole.PSYCHOLOGIST, "Anna", "Ivanova");
        User p2 = makeUser(UserRole.PSYCHOLOGIST, "Boris", "Petrov");

        when(userRepository.findByRole(UserRole.PSYCHOLOGIST)).thenReturn(List.of(p1, p2));
        when(profileRepository.findByUser(any())).thenReturn(Optional.empty());
        when(reviewRepository.findAverageRatingByPsychologist(any())).thenReturn(null);
        when(reviewRepository.findByPsychologistOrderByCreatedAtDesc(any())).thenReturn(Collections.emptyList());

        List<PsychologistResponse> result = psychologistService.getAllPsychologists("anna");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getFirstName()).isEqualTo("Anna");
    }

    @Test
    void getPsychologistById_returnsResponse() {
        User psy = makeUser(UserRole.PSYCHOLOGIST, "Anna", "Ivanova");
        PsychologistProfile profile = makeProfile(psy);

        when(userRepository.findById(psy.getId())).thenReturn(Optional.of(psy));
        when(profileRepository.findByUser(psy)).thenReturn(Optional.of(profile));
        when(reviewRepository.findAverageRatingByPsychologist(psy)).thenReturn(4.5);
        when(reviewRepository.findByPsychologistOrderByCreatedAtDesc(psy)).thenReturn(Collections.emptyList());

        PsychologistResponse result = psychologistService.getPsychologistById(psy.getId());

        assertThat(result.getFirstName()).isEqualTo("Anna");
        assertThat(result.getBio()).isEqualTo("Bio text");
        assertThat(result.getAverageRating()).isEqualTo(4.5);
        assertThat(result.getIsVerified()).isTrue();
    }

    @Test
    void getPsychologistById_notFound_throws() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> psychologistService.getPsychologistById(id))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void getPsychologistById_clientUser_throws() {
        User client = makeUser(UserRole.CLIENT, "Ivan", "Petrov");
        when(userRepository.findById(client.getId())).thenReturn(Optional.of(client));

        assertThatThrownBy(() -> psychologistService.getPsychologistById(client.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not a psychologist");
    }

    @Test
    void updateProfile_updatesFieldsAndReturnsResponse() {
        User psy = makeUser(UserRole.PSYCHOLOGIST, "Anna", "Ivanova");
        PsychologistProfile profile = makeProfile(psy);

        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setBio("New bio");
        req.setEducation("SPBU");
        req.setExperienceYears(10);

        when(profileRepository.findByUser(psy)).thenReturn(Optional.of(profile));
        when(profileRepository.save(profile)).thenReturn(profile);
        when(reviewRepository.findAverageRatingByPsychologist(psy)).thenReturn(null);
        when(reviewRepository.findByPsychologistOrderByCreatedAtDesc(psy)).thenReturn(Collections.emptyList());

        PsychologistResponse result = psychologistService.updateProfile(psy, req);

        assertThat(profile.getBio()).isEqualTo("New bio");
        assertThat(profile.getEducation()).isEqualTo("SPBU");
        assertThat(profile.getExperienceYears()).isEqualTo(10);
        assertThat(result).isNotNull();
    }
}
