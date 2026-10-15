import os
import joblib
from typing import Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

WEIGHTS_DIR = os.path.join(os.path.dirname(__file__), "weights")
MODEL_PATH = os.path.join(WEIGHTS_DIR, "synvex_fraud_classifier.joblib")

# Labeled training dataset of real-world cyber fraud, phishing, and legitimate messages
TRAINING_CORPUS = [
    # Fraud / Phishing samples (Label 1)
    ("Urgent: Your SBI netbanking account is blocked. Click here to verify your Aadhaar and PAN immediately.", 1),
    ("CBI Notice: You are placed under digital arrest for illegal narcotics parcel sent to Cambodia. Transfer verification bond.", 1),
    ("Dear customer, your electricity power will be disconnected tonight at 9:30 PM. Call power officer at 9876543210 immediately.", 1),
    ("Congratulations! You have won Rs 25,00,000 in KBC Lottery. Deposit registration fee Rs 12,500 to claim prize.", 1),
    ("Part-time job offer: Earn 5000 to 15000 rupees daily by simply liking YouTube videos and Telegram tasks.", 1),
    ("TRAI Alert: All SIM cards registered under your Aadhaar will be disconnected in 2 hours due to illegal activity. Press 9.", 1),
    ("Your credit card reward points worth 8,500 INR expiring today. Redeem cash directly to your bank account via this link.", 1),
    ("Police FIR registered against you at Delhi Cyber Cell. Download this APK file and install AnyDesk to verify your phone.", 1),
    ("Double your crypto in 24 hours! Guaranteed 200% return on Bitcoin and USDT mining pool. Join VIP Telegram group.", 1),
    ("Important KYC update required. Share the OTP received on your mobile number to avoid permanent account deactivation.", 1),
    ("Customs duty pending on your international parcel containing gold jewellery. Pay clearance tax to UPI id: customs.gov@upi", 1),
    ("Alert: Unauthorized transaction of Rs 49,999 detected. If not done by you, immediately share the one-time password to cancel.", 1),

    # Benign / Legitimate samples (Label 0)
    ("Meeting reminder: The product architecture review is scheduled for tomorrow at 10:00 AM in Conference Room B.", 0),
    ("Hi team, please find attached the weekly engineering progress report and sprint burndown chart for your review.", 0),
    ("Thank you for your purchase from Amazon India. Your order #402-8921827 has been dispatched and will arrive on Friday.", 0),
    ("Your monthly mobile postpaid bill of INR 649 is generated. You can view your itemized bill on our official portal.", 0),
    ("Hi Mom, I reached the hotel safely. The flight was on time and the weather here in Bengaluru is pleasant.", 0),
    ("GitHub notification: Pull request #42 'Add database migration for audit logs' has been approved by team lead.", 0),
    ("Please review the draft agreement for the campus hackathon sponsorship and share your feedback by end of day.", 0),
    ("Your flight ticket from Mumbai to New Delhi is confirmed. Web check-in opens 48 hours prior to departure.", 0),
    ("Appointment confirmed with Dr. Sharma for general consultation on Saturday at 4:30 PM. Please arrive 10 minutes early.", 0),
    ("Your quarterly dividend of Rs 350 has been credited directly to your registered bank account via NEFT.", 0),
    ("The library books borrowed on 5th October are due for return by next Monday. You can renew online if required.", 0),
    ("System maintenance alert: Our staging servers will be undergoing scheduled patching tonight between 2:00 AM and 4:00 AM.", 0)
]

_classifier_pipeline: Optional[Pipeline] = None

def train_and_persist_model() -> Pipeline:
    os.makedirs(WEIGHTS_DIR, exist_ok=True)
    texts, labels = zip(*TRAINING_CORPUS)
    
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_features=5000)),
        ('clf', LogisticRegression(C=2.0, class_weight='balanced', max_iter=200, random_state=42))
    ])
    
    pipeline.fit(texts, labels)
    joblib.dump(pipeline, MODEL_PATH)
    return pipeline

def get_fraud_classifier() -> Pipeline:
    global _classifier_pipeline
    if _classifier_pipeline is None:
        if os.path.exists(MODEL_PATH):
            try:
                _classifier_pipeline = joblib.load(MODEL_PATH)
            except Exception:
                _classifier_pipeline = train_and_persist_model()
        else:
            _classifier_pipeline = train_and_persist_model()
    return _classifier_pipeline

def classify_text_fraud(text: str) -> Dict[str, Any]:
    """
    Executes real scikit-learn ML inference using trained TF-IDF vectorizer and logistic regression classifier.
    Returns probabilities, top contributing n-grams, and classification confidence.
    """
    if not text or not text.strip():
        return {
            "status": "SKIPPED",
            "reason": "Empty text provided"
        }

    try:
        pipeline = get_fraud_classifier()
        probs = pipeline.predict_proba([text])[0]
        prob_benign = float(probs[0])
        prob_fraud = float(probs[1])

        # Feature explanation: extract top TF-IDF features present in the query text
        vectorizer: TfidfVectorizer = pipeline.named_steps['tfidf']
        clf: LogisticRegression = pipeline.named_steps['clf']
        
        feature_names = vectorizer.get_feature_names_out()
        tfidf_vec = vectorizer.transform([text]).toarray()[0]
        coefs = clf.coef_[0]
        
        # Calculate feature contributions (tf-idf weight * regression coefficient)
        contributions = []
        for idx in tfidf_vec.nonzero()[0]:
            word = feature_names[idx]
            weight = float(tfidf_vec[idx] * coefs[idx])
            contributions.append({"term": word, "impact": round(weight, 4)})
            
        contributions.sort(key=lambda x: abs(x["impact"]), reverse=True)

        return {
            "status": "COMPLETED",
            "model_name": "SYNVEX-FraudNLP-TFIDF-v2.1",
            "model_version": "2.1.0",
            "framework": "scikit-learn",
            "probabilities": {
                "legitimate": round(prob_benign, 4),
                "fraudulent_or_phishing": round(prob_fraud, 4)
            },
            "predicted_label": "CYBER_FRAUD_OR_PHISHING" if prob_fraud > 0.50 else "BENIGN_COMMUNICATION",
            "confidence": round(max(prob_benign, prob_fraud), 4),
            "top_ml_feature_contributions": contributions[:6],
            "known_limitations": "Trained on standard banking, digital arrest, and cyber-scam patterns. Obfuscated zero-width character text or novel dialect slang may require re-tokenization."
        }
    except Exception as e:
        return {
            "status": "MODEL_UNAVAILABLE",
            "model_name": "SYNVEX-FraudNLP-TFIDF-v2.1",
            "error": str(e)
        }
