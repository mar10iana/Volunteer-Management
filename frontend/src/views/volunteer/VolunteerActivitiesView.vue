<template>
  <div>
    <v-card class="table">
      <v-data-table
          :headers="headers"
          :items="activities"
          :search="search"
          disable-pagination
          :hide-default-footer="true"
          :mobile-breakpoint="0"
          data-cy="volunteerActivitiesTable"
      >
        <template v-slot:top>
          <v-card-title>
            <v-text-field
                v-model="search"
                append-icon="search"
                label="Search"
                class="mx-2"
            />
            <v-spacer />
          </v-card-title>
        </template>
        <template v-slot:[`item.themes`]="{ item }">
          <v-chip v-for="theme in item.themes" v-bind:key="theme.id">
            {{ theme.completeName }}
          </v-chip>
        </template>
        <template v-slot:[`item.action`]="{ item }">
          <v-tooltip v-if="item.state === 'APPROVED'" bottom>
            <template v-slot:activator="{ on }">
              <v-icon
                  class="mr-2 action-button"
                  color="red"
                  v-on="on"
                  data-cy="reportButton"
                  @click="reportActivity(item)"
              >warning</v-icon
              >
            </template>
            <span>Report Activity</span>
          </v-tooltip>
          <v-tooltip
              bottom
              v-if="item.state === 'APPROVED' && checkCondition(item)"
          >
            <template v-slot:activator="{ on }">
              <v-icon
                  class="mr-2 action-button"
                  color="blue"
                  v-on="on"
                  data-cy="writeAssessmentButton"
                  @click="writeAssessment(item)"
              >assignment</v-icon
              >
            </template>
            <span>Write Assessment</span>
          </v-tooltip>
          <v-tooltip v-if="isBeforeDeadline(item) && notYetEnrolled(item)" bottom>
          <template v-slot:activator="{ on }">
            <v-icon
              class="mr-2 action-button"
              color="blue"
              v-on="on"
              data-cy="enrollButton"
              @click="enrollActivity(item)"
              >login</v-icon
            >
          </template>
          <span>Apply for Activity</span>
        </v-tooltip>
        </template>
      </v-data-table>
      <assessment-dialog
          v-if="currentActivity && currentAssessment && assessmentDialog"
          v-model="assessmentDialog"
          :activity="currentActivity"
          :assessment="currentAssessment"
          v-on:save-assessment="onSaveAssessment"
          v-on:close-assessment-dialog="onCloseAssessmentDialog"
      />
      <enrollment-dialog
        v-if= "currentActivity && currentEnrollment && enrollmentDialog"
        v-model="enrollmentDialog"
        :activity="currentActivity"
        :enrollment="currentEnrollment"
        v-on:save-enrollment="onSaveEnrollment"
        v-on:close-enrollment-dialog="onCloseEnrollmentDialog"
      />
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import RemoteServices from '@/services/RemoteServices';
import Activity from '@/models/activity/Activity';
import Assessment from '@/models/assessment/Assessment';
import AssessmentDialog from '@/views/volunteer/AssessmentDialog.vue';
import Enrollment from '@/models/enrollment/Enrollment';
import EnrollmentDialog from '@/views/volunteer/EnrollmentDialog.vue';
import { show } from 'cli-cursor';
import Participation from '@/models/participation/Participation';

@Component({
  methods: { show },
  components: {
    'assessment-dialog': AssessmentDialog,
    'enrollment-dialog': EnrollmentDialog,
  },
})
export default class VolunteerActivitiesView extends Vue {
  activities: Activity[] = [];
  participations: Participation[] = [];
  assessments: Assessment[] = [];

  search: string = '';

  currentActivity: Activity | null = null;
  currentAssessment: Assessment | null = null;
  assessmentDialog: boolean = false;
  currentEnrollment: Enrollment | null = null;
  enrollmentDialog: boolean = false;
  enrollments: Enrollment[] = [];

  headers: object = [
    {
      text: 'Name',
      value: 'name',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Region',
      value: 'region',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Participants',
      value: 'participantsNumberLimit',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Themes',
      value: 'themes',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Description',
      value: 'description',
      align: 'left',
      width: '30%',
    },
    {
      text: 'State',
      value: 'state',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Start Date',
      value: 'formattedStartingDate',
      align: 'left',
      width: '5%',
    },
    {
      text: 'End Date',
      value: 'formattedEndingDate',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Application Deadline',
      value: 'formattedApplicationDeadline',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Actions',
      value: 'action',
      align: 'left',
      sortable: false,
      width: '5%',
    },
  ];

  async created() {
    await this.$store.dispatch('loading');
    try {
      this.activities = await RemoteServices.getActivities();
      this.participations = await RemoteServices.getVolunteerParticipations();
      this.assessments = await RemoteServices.getVolunteerAssessments();
      this.enrollments = await RemoteServices.getVolunteerEnrollments();
    } catch (error) {
      await this.$store.dispatch('error', error);
    }
    await this.$store.dispatch('clearLoading');
  }

  async reportActivity(activity: Activity) {
    if (activity.id !== null) {
      try {
        const result = await RemoteServices.reportActivity(
            this.$store.getters.getUser.id,
            activity.id,
        );
        this.activities = this.activities.filter((a) => a.id !== activity.id);
        this.activities.unshift(result);
      } catch (error) {
        await this.$store.dispatch('error', error);
      }
    }
  }


  checkCondition(activity: Activity): boolean {
    try {
      const activityEnded = new Date(activity.endingDate) < new Date();
      const hasAssessed = this.assessments.some(
        (assessment) => assessment.institutionId === activity.institution.id,
      );
      const hasParticipation = this.participations.some(
          (participation) => participation.activityId === activity.id,
      );
      return activityEnded && !hasAssessed && hasParticipation;
    } catch (error) {
      console.error('Error occurred while checking conditions:', error);
      return false;
    }
  }

  writeAssessment(activity: Activity) {
    this.currentActivity = activity;
    this.currentAssessment = new Assessment();
    this.assessmentDialog = true;
  }

  onCloseAssessmentDialog() {
    this.currentActivity = null;
    this.currentAssessment = null;
    this.assessmentDialog = false;
  }

  async onSaveAssessment() {
    if (
        this.currentActivity &&
        typeof this.currentActivity.id === 'number' &&
        this.currentAssessment != null
    ) {

      this.assessments = await RemoteServices.getVolunteerAssessments();

      this.currentActivity = null;
      this.currentAssessment = null;
      this.assessmentDialog = false;
    } else {
      console.error('Invalid currentActivity or currentActivity.id');
    }
  }
  enrollActivity(activity: Activity) {
    this.currentActivity = activity;
    this.currentEnrollment = new Enrollment();
    this.enrollmentDialog = true;
  }

  onCloseEnrollmentDialog() {
    this.currentActivity = null;
    this.currentEnrollment = null;
    this.enrollmentDialog = false;
  }

  async onSaveEnrollment() {
    this.enrollments.unshift(this.currentEnrollment as Enrollment);
    this.currentActivity = null;
    this.currentEnrollment = null;
    this.enrollmentDialog = false;
    location.reload();
  }

  //Check is "Apply for Activity" button is disabled
  isBeforeDeadline(activity: Activity): boolean {
    return new Date(activity.applicationDeadline) > new Date();
  }

  notYetEnrolled(activity: Activity): boolean {
    return (this.enrollments.every((enrollment) => enrollment.activityId !== activity.id));
  }

}
</script>

<style lang="scss" scoped></style>