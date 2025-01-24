<template>
  <v-dialog v-model="dialog" persistent width="1000">
    <v-card>
      <v-card-title class="headline">New Assessment</v-card-title>
      <v-card-text>
        <v-form ref="form">
          <v-textarea
              v-model="submitAssessment.review"
              label="*Review"
              rows="1"
              auto-grow
              :rules="[(v) => !!v || 'Review is required']"
              data-cy="reviewInput"
          ></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="$emit('close-assessment-dialog')" data-cy="closeButton">Close</v-btn>
        <v-btn color="blue darken-1" text @click="submit" v-if="canSubmit" data-cy="submitButton">Submit</v-btn>

      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop, Model } from 'vue-property-decorator';
import Activity from '@/models/activity/Activity';
import Assessment from '@/models/assessment/Assessment';
import RemoteServices from '@/services/RemoteServices';


@Component
export default class AssessmentDialog extends Vue {
  @Model('dialog', Boolean) dialog!: boolean;
  @Prop({ type: Activity, required: true }) readonly activity!: Activity;
  @Prop({ type: Assessment, required: true }) readonly assessment!: Assessment;

  submitAssessment: Assessment = new Assessment();

  async created() {
    this.submitAssessment = new Assessment(this.assessment);
  }

  get canSubmit(): boolean {
    return !!this.submitAssessment.review && this.submitAssessment.review.length >= 10;
  }

  async submit() {
    if ((this.$refs.form as Vue & { validate: () => boolean }).validate() && this.activity.institution.id !== null) {
      try {
        const result = await RemoteServices.createAssessment(this.activity.institution.id, this.submitAssessment);
        this.$emit('save-assessment', result);
      } catch (error) {
        await this.$store.dispatch('error', error);
      }
    }
  }
}
</script>

<style scoped lang="scss"></style>
