import axios from "axios";

export const fetchTrials = async (disease: string) => {
  try {
    const res = await axios.get(
      "https://clinicaltrials.gov/api/v2/studies",
      {
        params: {
          "query.cond": disease,
          "filter.overallStatus": "RECRUITING",
          pageSize: 5,
          format: "json",
        },
      }
    );

    const studies = res.data.studies || [];

    return studies.map((study: any) => ({
      id: study.protocolSection?.identificationModule?.nctId,
      title: study.protocolSection?.identificationModule?.briefTitle,
      abstract:
        study.protocolSection?.descriptionModule?.briefSummary || "",
      status:
        study.protocolSection?.statusModule?.overallStatus || "",
      eligibility:
        study.protocolSection?.eligibilityModule?.eligibilityCriteria || "",
      location:
        study.protocolSection?.contactsLocationsModule?.locations || [],
      source: "clinical_trials",
      type: "trial",
    }));
  } catch (error) {
    console.error("Clinical Trials Error:", error);
    return [];
  }
};