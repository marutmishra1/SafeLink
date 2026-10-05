import { useRef, useState } from "react";

function EmergencyAlert() {
  const fileInputRef = useRef(null);

  const [alertType, setAlertType] = useState("Medical");
  const [message, setMessage] = useState("");
  const [locationEnabled, setLocationEnabled] = useState(false);

  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);

  const handleAttachmentSelect = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setAttachment(file);

    if (file.type.startsWith("image/")) {
      const previewUrl = URL.createObjectURL(file);
      setAttachmentPreview(previewUrl);
    } else {
      setAttachmentPreview(null);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendAlert = () => {
    if (!message.trim()) {
      return;
    }


    // Backend connection will be added later.
  };

  return (
    <section id="emergency" className="emergency-section">
      <div className="container">

        <div className="emergency-page-card">

          {/* LEFT SIDE */}
          <div className="emergency-page-info">

            <div className="emergency-icon-large">
              ⚠
            </div>

            <span className="emergency-label">
              EMERGENCY NETWORK
            </span>

            <h2>
              Need immediate assistance?
            </h2>

            <p>
              Create an emergency alert with the
              information responders and nearby
              users need.
            </p>

            <div className="emergency-network-status">
              <span className="status-dot"></span>
              <span>Network ready</span>
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="emergency-page-form">

            {/* EMERGENCY TYPE */}
            <div className="form-group">

              <label htmlFor="emergency-alert-type">
                Emergency type
              </label>

              <select
                id="emergency-alert-type"
                value={alertType}
                onChange={(event) =>
                  setAlertType(event.target.value)
                }
                className="form-control-custom"
              >
                <option value="Medical">
                  Medical
                </option>

                <option value="Trapped">
                  Trapped / Need Rescue
                </option>

                <option value="Fire">
                  Fire
                </option>

                <option value="Flood">
                  Flood
                </option>

                <option value="Accident">
                  Accident
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

            </div>

            {/* MESSAGE */}
            <div className="form-group">

              <label htmlFor="emergency-alert-message">
                Emergency message
              </label>

              <textarea
                id="emergency-alert-message"
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                className="form-control-custom"
                placeholder="Describe what is happening..."
                rows="6"
                maxLength="300"
              />

              <div className="character-count">
                {message.length}/300
              </div>

            </div>

            {/* ATTACHMENT */}
            <div className="emergency-attachment">

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleAttachmentSelect}
                hidden
              />

              {!attachment ? (
                <button
                  type="button"
                  className="attachment-upload-btn"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >
                  <span className="attachment-icon">
                    📎
                  </span>

                  <span>
                    Attach image or file
                  </span>
                </button>
              ) : (
                <div className="attachment-preview">

                  <div className="attachment-preview-content">

                    {attachmentPreview ? (
                      <img
                        src={attachmentPreview}
                        alt="Emergency attachment preview"
                        className="emergency-image-preview"
                      />
                    ) : (
                      <div className="attachment-file-icon">
                        📎
                      </div>
                    )}

                    <div className="attachment-file-info">

                      <strong>
                        {attachment.name}
                      </strong>

                      <span>
                        {(
                          attachment.size / 1024
                        ).toFixed(1)}{" "}
                        KB
                      </span>

                    </div>

                  </div>

                  <button
                    type="button"
                    className="remove-attachment-btn"
                    onClick={handleRemoveAttachment}
                    aria-label="Remove attachment"
                  >
                    ×
                  </button>

                </div>
              )}

            </div>

            {/* LOCATION */}
            <label className="location-option">

              <input
                type="checkbox"
                checked={locationEnabled}
                onChange={(event) =>
                  setLocationEnabled(
                    event.target.checked
                  )
                }
              />

              <span className="custom-checkbox"></span>

              <span>
                Share my location with this alert
              </span>

            </label>

            {/* SEND */}
            <button
              className="send-alert-btn emergency-page-send"
              onClick={handleSendAlert}
              disabled={!message.trim()}
            >
              <span>⚠</span>

              Send Emergency Alert
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}

export default EmergencyAlert;