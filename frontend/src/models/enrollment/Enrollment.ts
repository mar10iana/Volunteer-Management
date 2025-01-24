import { ISOtoString } from '@/services/ConvertDateService';

export default class Enrollment {
  id: number | null = null;
  motivation!: string;
  enrollmentDateTime!: string;
  volunteerName!: string;
  participating!: string;
  volunteerId!: number;
  activityId!: number | null;

  constructor(jsonObj?: Enrollment) {
    if (jsonObj) {
      this.id = jsonObj.id;
      this.motivation = jsonObj.motivation;
      this.enrollmentDateTime = ISOtoString(jsonObj.enrollmentDateTime);
      this.volunteerName = jsonObj.volunteerName;
      this.participating = jsonObj.participating;
      this.volunteerId = jsonObj.volunteerId;
      console.log('ts' + this.volunteerId);
      this.activityId = jsonObj.activityId;
    }
  }
}
