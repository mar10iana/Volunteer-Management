<template>
  <v-dialog v-model="dialog" persistent max-width="500">
    <v-card>
      <v-card-title class="headline">Select Participant</v-card-title>
      <v-card-text>
        <v-form ref="form" lazy-validation>
          <v-text-field
            label="Participant Rating (1-5)"
            v-model="rating"
            :rules="[
              (v) =>
                v === '' ||
                (!isNaN(v) &&
                  Number.isInteger(parseInt(v)) &&
                  v >= 1 &&
                  v <= 5) ||
                'Rating must be an integer between 1 and 5',
            ]"
            type="number"
            placeholder="Enter a rating between 1 and 5"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="$emit('close-participation-selection-dialog')"
        >
          CLOSE
        </v-btn>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="selectParticipant"
          data-cy="saveParticipation"
        >
          MAKE PARTICIPANT
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Model, Prop } from 'vue-property-decorator';
import Activity from '@/models/activity/Activity';
import Participation from '@/models/participation/Participation';
import RemoteServices from '@/services/RemoteServices';
import Enrollment from '@/models/enrollment/Enrollment';

@Component
export default class ParticipationSelectionDialog extends Vue {
  @Model('dialog', Boolean) dialog!: boolean;
  @Prop({ type: Activity, required: true }) readonly activity!: Activity;
  @Prop({ type: Enrollment, required: true }) readonly enrollment!: Enrollment;
  @Prop({ type: Participation, required: true })
  readonly participation!: Participation;
  rating: string = '';

  submitParticipation: Participation = new Participation();

  async created() {
    this.submitParticipation = new Participation(this.participation);
  }

  async selectParticipant() {
    if (
      (this.$refs.form as Vue & { validate: () => boolean }).validate() &&
      this.activity.id !== null
    ) {
      try {
        this.submitParticipation.rating = parseInt(this.rating);
        const result = await RemoteServices.createParticipation(
          this.activity.id,
          this.submitParticipation,
        );

        // Emit the result
        this.$emit('save-participation', result);
      } catch (error) {
        await this.$store.dispatch('error', error);
      }
    }
  }
}
</script>

<style scoped lang="scss"></style>
