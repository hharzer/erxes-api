import { Model, model } from 'mongoose';
import { Fields } from '.';
import { ILead, ILeadDocument, leadSchema } from './definitions/leads';

export interface ILeadModel extends Model<ILeadDocument> {
  generateCode(): string;
  createLead(doc: ILead, createdUserId?: string): Promise<ILeadDocument>;

  updateLead(_id, { themeColor, callout, rules }: ILead): Promise<ILeadDocument>;

  removeLead(_id: string): void;
  duplicate(_id: string): Promise<ILeadDocument>;
}

export const loadClass = () => {
  class Lead {
    /**
     * Creates a lead document
     */
    public static async createLead(doc: ILead, createdUserId?: string) {
      if (!createdUserId) {
        throw new Error('createdUser must be supplied');
      }

      return Leads.create({
        ...doc,
        createdDate: new Date(),
        createdUserId,
      });
    }

    /**
     * Updates a lead document
     */
    public static async updateLead(_id: string, doc: ILead) {
      await Leads.updateOne({ _id }, { $set: doc }, { runValidators: true });

      return Leads.findOne({ _id });
    }

    /**
     * Remove a lead
     */
    public static async removeLead(_id: string) {
      // remove fields
      await Fields.deleteMany({ contentType: 'lead', contentTypeId: _id });

      return Leads.deleteOne({ _id });
    }

    /**
     * Duplicates lead and lead fields of the lead
     */
    public static async duplicate(_id: string) {
      const lead = await Leads.findOne({ _id });

      if (!lead) {
        throw new Error('Lead not found');
      }

      // duplicate lead ===================
      const newLead = await this.createLead({ formId: lead.formId }, lead.createdUserId);

      return newLead;
    }
  }

  leadSchema.loadClass(Lead);

  return leadSchema;
};

loadClass();

// tslint:disable-next-line
const Leads = model<ILeadDocument, ILeadModel>('leads', leadSchema);

export default Leads;
