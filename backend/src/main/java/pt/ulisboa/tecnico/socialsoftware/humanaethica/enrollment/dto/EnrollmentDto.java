package pt.ulisboa.tecnico.socialsoftware.humanaethica.enrollment.dto;

import pt.ulisboa.tecnico.socialsoftware.humanaethica.activity.domain.Activity;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.enrollment.domain.Enrollment;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.participation.domain.Participation;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.utils.DateHandler;

public class EnrollmentDto {
    private Integer id;
    private String motivation;

    private String enrollmentDateTime;
    private Integer activityId;

    private String volunteerName;
    private String participating;
    private Integer volunteerId;


    public EnrollmentDto() {}

    public EnrollmentDto(Enrollment enrollment) {
        this.id = enrollment.getId();
        this.motivation = enrollment.getMotivation();
        this.enrollmentDateTime = DateHandler.toISOString(enrollment.getEnrollmentDateTime());
        this.volunteerName = enrollment.getVolunteerName();
        this.participating = isParticipating(enrollment.getActivity());
        this.volunteerId = enrollment.getVolunteerId();
        this.activityId = enrollment.getActivity().getId();
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getMotivation() {
        return motivation;
    }

    public void setMotivation(String motivation) {
        this.motivation = motivation;
    }

    public String getEnrollmentDateTime() {
        return enrollmentDateTime;
    }

    public void setEnrollmentDateTime(String enrollmentDateTime) {
        this.enrollmentDateTime = enrollmentDateTime;
    }

    public String getVolunteerName() {
        return volunteerName;
    }

    public String getParticipating() {
        return participating;
    }

    public Integer getVolunteerId() { return volunteerId; }

    public String isParticipating(Activity activity) {
        if(activity.getParticipations() != null || !activity.getParticipations().isEmpty()) {
            if (activity.getParticipations().stream()
                    .anyMatch(participation -> participation.getVolunteer().getName().equals(this.volunteerName))) {
                return "true";
            } else {
                return "false";
            }
        } else {
            return "false";
        }
    }

    public Integer getActivityId() {
        return activityId;
    }

    public void setActivityId(Integer activityId) {
        this.activityId = activityId;
    }

}
