import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase.ts';

// In-memory caching of the OAuth access token (never stored in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;

export const hasGoogleFormsAccess = (): boolean => {
  return !!cachedAccessToken;
};

export const getGoogleFormsAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const clearGoogleFormsAccess = (): void => {
  cachedAccessToken = null;
};

/**
 * Trigger OAuth popup for Google Forms administration permissions (Admin only)
 */
export const authorizeGoogleForms = async (): Promise<string> => {
  const provider = new GoogleAuthProvider();
  // Request specific scopes for forms management and response capture
  provider.addScope('https://www.googleapis.com/auth/forms.body');
  provider.addScope('https://www.googleapis.com/auth/forms.responses.readonly');

  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('OAuth authentication succeeded but could not capture the access token.');
    }
    cachedAccessToken = credential.accessToken;
    return cachedAccessToken;
  } catch (error: any) {
    console.error('Error during Google Workspace forms authorization:', error);
    throw error;
  }
};

export interface GoogleFormMetadata {
  formId: string;
  title: string;
  description?: string;
  editUri: string;
  responderUri: string;
  createdTime: string;
}

/**
 * Creates a beautiful pre-configured customer satisfaction and feedback Google Form
 */
export const createMakhanaCampaignForm = async (
  title: string,
  description: string
): Promise<GoogleFormMetadata> => {
  if (!cachedAccessToken) {
    throw new Error('Access token is not initialized. Please connect Google Forms first.');
  }

  // 1. Create the base form shell
  const createResponse = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cachedAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title: title,
        documentTitle: `Aditya Nutra Farms: ${title}`
      }
    })
  });

  if (!createResponse.ok) {
    const errText = await createResponse.text();
    throw new Error(`Failed to create form: ${createResponse.statusText} (${errText})`);
  }

  const formShell = await createResponse.json();
  const formId = formShell.formId;
  const responderUri = formShell.responderUri;

  // 2. Add question items to the created form shell
  const batchResponse = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cachedAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          updateFormInfo: {
            info: {
              description: description,
            },
            updateMask: 'description'
          }
        },
        {
          createItem: {
            item: {
              title: "How would you rate the quality and taste of Aditya Nutra Farms Makhana? / आप आदित्य न्यूट्रा फार्म्स के मखाने की गुणवत्ता और स्वाद को कैसे आंकेंगे?",
              questionItem: {
                question: {
                  required: true,
                  choiceQuestion: {
                    type: "RADIO",
                    options: [
                      { value: "⭐⭐⭐⭐⭐ 5 - Superior Premium Quality / अत्यंत उत्कृष्ट" },
                      { value: "⭐⭐⭐⭐ 4 - Delicious Roasted Flavor / बहुत स्वादिष्ट" },
                      { value: "⭐⭐⭐ 3 - Satisfactory Crunch / संतोषजनक" },
                      { value: "⭐⭐ 2 - Average Experience / साधारण" },
                      { value: "⭐ 1 - Not Crispy / सुधार की आवश्यकता है" }
                    ]
                  }
                }
              },
              description: "Rate based on size, crispiness, and flavor richness."
            },
            location: { index: 0 }
          }
        },
        {
          createItem: {
            item: {
              title: "Which Bihar Makhana flavor is your absolute favourite? / आपका पसंदीदा मखाना फ्लेवर कौन सा है?",
              questionItem: {
                question: {
                  required: true,
                  choiceQuestion: {
                    type: "CHECKBOX",
                    options: [
                      { value: "🌾 Jumbo Premium Raw (Natural / सादा मखाना)" },
                      { value: "🧂 Classic Salted & Fresh Ghee Roasted (क्लासिक घी रोस्टेड)" },
                      { value: "🔥 Spicy Roasted Peri-Peri (तीखा पेरी-पेरी)" },
                      { value: "🍃 Fresh Pudina Punch (पुदीना पंच)" },
                      { value: "🍯 Sweet Caramel Pop-nuts (मीठा कैरेमल मखाना)" }
                    ]
                  }
                }
              },
              description: "You may tick multiple favorites!"
            },
            location: { index: 1 }
          }
        },
        {
          createItem: {
            item: {
              title: "Your thoughts: What can Aditya Nutra Farms improve next? / हमारे लिए कोई विशेष सुझाव?",
              questionItem: {
                question: {
                  required: false,
                  textQuestion: {
                    paragraph: true
                  }
                }
              },
              description: "Tell us about packaging, delivery speed, or custom flavor requests."
            },
            location: { index: 2 }
          }
        }
      ]
    })
  });

  if (!batchResponse.ok) {
    const errText = await batchResponse.text();
    throw new Error(`Failed to populate form fields: ${batchResponse.statusText} (${errText})`);
  }

  return {
    formId,
    title,
    description,
    editUri: `https://docs.google.com/forms/d/${formId}/edit`,
    responderUri,
    createdTime: new Date().toISOString()
  };
};

export interface GoogleFormResponseSummary {
  totalResponses: number;
  ratingsDistribution: { [star: string]: number };
  flavorVotes: { [flavor: string]: number };
  commentsHistory: string[];
}

/**
 * Fetches and parses responses for a Google Form to design interactive dashboards
 */
export const fetchGoogleFormResponses = async (
  formId: string
): Promise<GoogleFormResponseSummary> => {
  if (!cachedAccessToken) {
    throw new Error('Access token is missing. Please reconnect Google Forms.');
  }

  const url = `https://forms.googleapis.com/v1/forms/${formId}/responses`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${cachedAccessToken}`
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch responses: ${response.statusText} (${errText})`);
  }

  const data = await response.json();
  const responsesList = data.responses || [];

  const ratingsDistribution: { [star: string]: number } = { '5 Star': 0, '4 Star': 0, '3 Star': 0, '2 Star': 0, '1 Star': 0 };
  const flavorVotes: { [flavor: string]: number } = {};
  const commentsHistory: string[] = [];

  responsesList.forEach((resp: any) => {
    const answers = resp.answers || {};
    Object.values(answers).forEach((ansObj: any) => {
      const textAnswers = ansObj.textAnswers?.answers || [];
      textAnswers.forEach((item: any) => {
        const val = item.value || '';
        
        // 1. Detect ratings
        if (val.includes('5 -') || val.includes('⭐⭐⭐⭐⭐')) {
          ratingsDistribution['5 Star']++;
        } else if (val.includes('4 -') || val.includes('⭐⭐⭐⭐')) {
          ratingsDistribution['4 Star']++;
        } else if (val.includes('3 -') || val.includes('⭐⭐⭐')) {
          ratingsDistribution['3 Star']++;
        } else if (val.includes('2 -') || val.includes('⭐⭐')) {
          ratingsDistribution['2 Star']++;
        } else if (val.includes('1 -') || val.includes('⭐')) {
          ratingsDistribution['1 Star']++;
        }
        
        // 2. Detect flavors
        else if (
          val.includes('Jumbo') || 
          val.includes('Classic') || 
          val.includes('Peri-Peri') || 
          val.includes('Pudina') || 
          val.includes('Caramel') ||
          val.includes('जी रोस्टेड') ||
          val.includes('पेरी-पेरी')
        ) {
          const cleanName = val.split('/')[0].split('(')[0].trim();
          flavorVotes[cleanName] = (flavorVotes[cleanName] || 0) + 1;
        }

        // 3. Collect fallback comments if long text list
        else if (val.length > 5) {
          commentsHistory.push(val);
        }
      });
    });
  });

  return {
    totalResponses: responsesList.length,
    ratingsDistribution,
    flavorVotes,
    commentsHistory
  };
};
