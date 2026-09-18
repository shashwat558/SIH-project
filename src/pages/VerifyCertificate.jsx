import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { CheckCircle2, ShieldCheck, Search } from "lucide-react";

export default function VerifyCertificate() {
const urlParams = new URLSearchParams(window.location.search);
const qrCertificateId = urlParams.get("certificateId");
  const [certificateId, setCertificateId] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
useEffect(() => {
  if (qrCertificateId) {
    setCertificateId(qrCertificateId);
    verifyCertificate(qrCertificateId);
  }
}, [qrCertificateId]);


  const verifyCertificate = async (certificateIdFromQR = null) => {
  const id = (certificateIdFromQR || certificateId).trim();
    if (!id) {
      setError("Please enter a Certificate ID.");
      setCertificate(null);
      return;
    }

    setLoading(true);
    setError("");
    setCertificate(null);

    const { data, error: supabaseError } = await supabase
      .from("pilot_certificates")
      .select("*")
      .eq("certificate_id", id)
      .maybeSingle();

    setLoading(false);

    if (supabaseError) {
      console.error(supabaseError);
      setError("Unable to verify certificate. Please try again.");
      return;
    }

    if (!data) {
      setError("Certificate not found. Please check the Certificate ID.");
      return;
    }

    setCertificate(data);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "40px 20px"
      }}
    >
      <div
        style={{
          maxWidth: "750px",
          margin: "0 auto"
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px"
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              margin: "0 auto 15px",
              borderRadius: "50%",
              background: "#dbeafe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <ShieldCheck size={32} color="#2563eb" />
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: "700",
              color: "#0f172a"
            }}
          >
            Verify Pilot Certificate
          </h1>

          <p
            style={{
              color: "#64748b",
              marginTop: "8px"
            }}
          >
            Verify a Startup2Gov pilot certificate using its unique
            Certificate ID.
          </p>
        </div>

        {/* Search Section */}
        <div
          style={{
            background: "#ffffff",
            padding: "25px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            marginBottom: "25px"
          }}
        >
          <label
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "8px",
              color: "#334155"
            }}
          >
            Certificate ID
          </label>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap"
            }}
          >
            <input
              type="text"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  verifyCertificate();
                }
              }}
              placeholder="S2G-PILOT-000001-123456"
              style={{
                flex: 1,
                minWidth: "250px",
                padding: "13px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontFamily: "monospace",
                fontSize: "14px"
              }}
            />

            <button
              onClick={verifyCertificate}
              disabled={loading}
              style={{
                padding: "13px 20px",
                border: "none",
                borderRadius: "8px",
                background: "#2563eb",
                color: "#ffffff",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Search size={18} />
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>

          {error && (
            <div
              style={{
                marginTop: "15px",
                padding: "12px 15px",
                background: "#fee2e2",
                color: "#991b1b",
                borderRadius: "8px"
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Verified Certificate */}
        {certificate && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #bbf7d0",
              overflow: "hidden"
            }}
          >
            {/* Verified Header */}
            <div
              style={{
                padding: "20px",
                background: "#f0fdf4",
                borderBottom: "1px solid #bbf7d0",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}
            >
              <CheckCircle2
                size={28}
                color="#16a34a"
              />

              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#166534"
                  }}
                >
                  Certificate Verified
                </h2>

                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#15803d",
                    fontSize: "14px"
                  }}
                >
                  This certificate exists in the Startup2Gov database.
                </p>
              </div>
            </div>

            {/* Certificate Details */}
            <div
              style={{
                padding: "25px"
              }}
            >
              <div style={{ marginBottom: "18px" }}>
                <strong>Certificate ID</strong>

                <p
                  style={{
                    margin: "5px 0",
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                    color: "#475569"
                  }}
                >
                  {certificate.certificate_id}
                </p>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <strong>Startup</strong>

                <p
                  style={{
                    margin: "5px 0",
                    color: "#475569"
                  }}
                >
                  {certificate.startup_name}
                </p>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <strong>Solution</strong>

                <p
                  style={{
                    margin: "5px 0",
                    color: "#475569"
                  }}
                >
                  {certificate.solution_title}
                </p>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <strong>Department</strong>

                <p
                  style={{
                    margin: "5px 0",
                    color: "#475569"
                  }}
                >
                  {certificate.department || "Government Department"}
                </p>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <strong>Issue Date</strong>

                <p
                  style={{
                    margin: "5px 0",
                    color: "#475569"
                  }}
                >
                  {certificate.issue_date}
                </p>
              </div>

              <div
                style={{
                  padding: "12px 15px",
                  background: "#f0fdf4",
                  color: "#166534",
                  borderRadius: "8px",
                  fontWeight: "600"
                }}
              >
                ✓ Status: {certificate.status}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}