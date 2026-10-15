# SYNVEX ML/DL Model Specifications

## 1. Deep Learning Detector: `SYNVEX-Spectral-CNN-v1.4`
- **Architecture**: Residual Multi-Scale Convolutional Network with Spatial-Frequency Pooling.
- **Framework**: PyTorch 2.x (`torch`, `torchvision`).
- **Input Resolution**: 224 x 224 x 3 (Bicubic interpolation, ImageNet normalization: mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]).
- **Spectral Feature Preprocessor**: 2D Fast Fourier Transform (FFT) extracting logarithmic power magnitude spectrum, calculating high-frequency-to-core energy ratios and spectral variance.
- **Task**: Deepfake artifact detection and generative AI synthetic image classification (GAN & Diffusion generators).
- **Inference Execution**:
  - Genuine forward pass with `torch.no_grad()`.
  - Computes Softmax probabilities across `[Authentic, Synthetic]`.
  - Calibrated probability formula: `calibrated_p = min(1.0, prob_synthetic * 0.85 + spectral_anomaly_mod)`.
- **Known Limitations**: Heavy image downscaling (<128px) or multiple social media re-compression passes can attenuate high-frequency generative cues.

## 2. Secondary ML Component: `SYNVEX-FraudNLP-TFIDF-v2.1`
- **Architecture**: `TfidfVectorizer(ngram_range=(1,2), max_features=5000)` + `LogisticRegression(C=2.0, class_weight='balanced')`.
- **Framework**: Scikit-Learn.
- **Task**: Cyber-fraud, digital arrest extortion, and phishing text classification.
- **Training Data**: Labeled corpus of verified digital arrest notices, illegal parcel threats, electricity bill scams, bank OTP phishing vs legitimate corporate communications and receipts.
- **Explainability**: Calculates token-level regression impact coefficients `(tf-idf * beta)` to extract top contributing n-grams.
- **Known Limitations**: Slang dialects or adversarial zero-width unicode obfuscation require normalization.
