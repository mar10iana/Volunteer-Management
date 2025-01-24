<template>
  <v-card class="table">
    <div class="text-h3">{{ activity.name }}</div>
    <v-data-table
      :headers="headers"
      :items="enrollments"
      :search="search"
      disable-pagination
      :hide-default-footer="true"
      :mobile-breakpoint="0"
      data-cy="activityEnrollmentsTable"
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
          <v-btn
            color="primary"
            dark
            @click="getActivities"
            data-cy="getActivities"
            >Activities</v-btn
          >
        </v-card-title>
      </template>
      <template v-slot:[`item.action`]="{ item }">
        <v-tooltip bottom v-if="isParticipating(item) && hasSpace()">
          <template v-slot:activator="">
            <v-card-title>
              <v-btn
                color="primary"
                dark
                @click="selectParticipants(item)"
                data-cy="createButton"
                >Select Participants</v-btn
              >
            </v-card-title>
          </template>
          <span>Select Participant</span>
        </v-tooltip>
      </template>
    </v-data-table>
    <participation-selection-dialog
      v-if="selectParticipant"
      v-model="selectParticipant"
      :activity="currentActivity"
      :enrollment="currentEnrollment"
      :participation="currentParticipation"
      v-on:save-participation="onSaveParticipation"
      v-on:close-participation-selection-dialog="
        onCloseParticipationSelectionDialog
      "
    />
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import RemoteServices from '@/services/RemoteServices';
import Activity from '@/models/activity/Activity';
import Enrollment from '@/models/enrollment/Enrollment';
import ParticipationSelectionDialog from '@/views/member/ParticipationSelectionDialog.vue';
import Participation from '@/models/participation/Participation';

@Component({
  components: {
    'participation-selection-dialog': ParticipationSelectionDialog,
  },
})
export default class InstitutionActivityEnrollmentsView extends Vue {
  enrollments: Enrollment[] = [];
  search: string = '';
  activity!: Activity;

  currentEnrollment: Enrollment | null = null;
  currentActivity: Activity | null = null;
  currentParticipation: Participation | null = null;
  selectParticipant: boolean = false;

  headers: object = [
    {
      text: 'Motivation',
      value: 'motivation',
      align: 'left',
      width: '30%',
    },
    {
      text: 'Application Date',
      value: 'enrollmentDateTime',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Volunteer Name',
      value: 'volunteerName',
      align: 'left',
      width: '20%',
    },
    {
      text: 'Participating',
      value: 'participating',
      align: 'left',
      width: '25%',
    },
    {
      text: 'Actions',
      value: 'action',
      align: 'left',
      sortable: false,
      width: '20%',
    },
  ];

  async created() {
    this.activity = this.$store.getters.getActivity;
    if (this.activity !== null && this.activity.id !== null) {
      await this.$store.dispatch('loading');
      try {
        this.enrollments = await RemoteServices.getActivityEnrollments(
          this.activity.id,
        );
      } catch (error) {
        await this.$store.dispatch('error', error);
      }
      await this.$store.dispatch('clearLoading');
    }
  }

  async getActivities() {
    await this.$store.dispatch('setActivity', null);
    this.$router.push({ name: 'institution-activities' }).catch(() => {});
  }

  async selectParticipants(enrollment: Enrollment) {
    this.currentEnrollment = enrollment;
    this.currentActivity = this.activity;
    this.currentParticipation = new Participation();
    this.currentParticipation.volunteerId = this.currentEnrollment.volunteerId;

    this.selectParticipant = true;
  }

  hasSpace() {
    return (
      this.activity.participantsNumberLimit >
      this.activity.numberOfParticipations
    );
  }

  isParticipating(enrollment: Enrollment) {
    return enrollment.participating == 'false';
  }

  onCloseParticipationSelectionDialog() {
    this.currentEnrollment = null;
    this.currentActivity = null;
    this.selectParticipant = false;
  }

  async onSaveParticipation() {
    this.activity.numberOfParticipations++;

    if (this.currentEnrollment != null)
      this.currentEnrollment.participating = 'true';

    this.currentEnrollment = null;
    this.currentActivity = null;

    this.selectParticipant = false;
  }
}
</script>

<style lang="scss" scoped>
.date-fields-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.date-fields-row {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}
</style>
