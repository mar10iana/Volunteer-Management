<template>
  <v-dialog v-model="dialog" persistent width="1000">
    <v-card>
      <v-card-title class="headline">New Application</v-card-title>
      <v-card-text>
        <v-form ref="form">
          <v-textarea
            v-model="submitEnrollment.motivation"
            label="*Motivation"
            rows="1"
            auto-grow
            :rules="[(v) => !!v || 'Motivation is required']"
            data-cy="motivationInput"
          ></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="$emit('close-enrollment-dialog')" data-cy="closeButton">Close</v-btn>
        <v-btn color="blue darken-1" text @click="submit" v-if="canSubmit" data-cy="submitButton">Submit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { Vue, Component, Prop, Model } from 'vue-property-decorator';
import Activity from '@/models/activity/Activity';
import Enrollment from '@/models/enrollment/Enrollment';
import RemoteServices from '@/services/RemoteServices';

@Component
export default class EnrollmentDialog extends Vue {
  @Model('dialog', Boolean) dialog!: boolean;
  @Prop({ type: Activity, required: true }) readonly activity!: Activity;
  @Prop({ type: Enrollment, required: true }) readonly enrollment!: Enrollment;

  submitEnrollment: Enrollment = new Enrollment();
  cypressCondition: boolean = false;

  async created() {
  this.submitEnrollment = new Enrollment(this.enrollment);
  }

  get canSubmit(): boolean {
    return this.cypressCondition || (!!this.submitEnrollment.motivation && this.submitEnrollment.motivation.length >= 10);
  }

  async submit() {
    if ((this.$refs.form as Vue & { validate: () => boolean }).validate() && this.activity.id !== null) {
      try {
        const result = await RemoteServices.createEnrollment(this.activity.id, this.submitEnrollment);
        this.$emit('save-enrollment', result);
      } catch (error) {
        await this.$store.dispatch('error', error);
      }
    }
  }
}
</script>

<style scoped lang="scss"></style>