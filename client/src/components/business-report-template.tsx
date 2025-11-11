import { Building2, Mail, Phone, MapPin, Globe, FileText } from "lucide-react";
import { type BusinessProfile } from "@shared/schema";
import IconLogoDisplay from "./icon-logo-display";

interface BusinessReportTemplateProps {
  profile: BusinessProfile;
}

export function BusinessReportTemplate({
  profile,
}: BusinessReportTemplateProps) {
  const currentDate = new Date().toLocaleDateString();

  return (
    <div
      className="business-report-print bg-white p-8 max-w-4xl mx-auto"
      style={{ color: "black", background: "white" }}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .business-report-print, .business-report-print * {
            visibility: visible;
          }
          .business-report-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          .no-print, .no-print * {
            display: none !important;
          }
          .modal-overlay {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="border-b-2 border-gray-200 pb-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <IconLogoDisplay
              width={64}
              height={64}
              className="rounded-lg"
              showFallback={true}
              fallbackText="SN"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.businessName}
              </h1>
              <p className="text-lg text-gray-600">{profile.businessType}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold text-gray-900">
              Business Report
            </h2>
            <p className="text-gray-600">Generated on {currentDate}</p>
          </div>
        </div>
      </div>

      {/* Owner Information */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Building2 className="w-5 h-5 mr-2" />
          Owner Information
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="font-medium text-gray-700">Owner Name:</p>
            <p className="text-gray-900">{profile.ownerName}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Business Type:</p>
            <p className="text-gray-900">{profile.businessType}</p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          Contact Information
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="font-medium text-gray-700">Email:</p>
            <p className="text-gray-900">{profile.email}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Phone:</p>
            <p className="text-gray-900">{profile.phone}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Website:</p>
            <p className="text-gray-900">{profile.website || "N/A"}</p>
          </div>
        </div>
      </section>

      {/* Address Information */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Business Address
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-900">
            {profile.address}
            <br />
            {profile.city}, {profile.state} {profile.zipCode}
            <br />
            {profile.country}
          </p>
        </div>
      </section>

      {/* Legal Information */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Legal Information
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="font-medium text-gray-700">Tax ID / EIN:</p>
            <p className="text-gray-900">{profile.taxId || "Not provided"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Business License:</p>
            <p className="text-gray-900">
              {profile.licenseNumber || "Not provided"}
            </p>
          </div>
        </div>
      </section>

      {/* Business Description */}
      {profile.description && (
        <section className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Business Description
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-900">{profile.description}</p>
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="border-t-2 border-gray-200 pt-6 mt-8">
        <div className="text-center text-gray-600">
          <p>
            This report was generated automatically by SolNet Business
            Management System
          </p>
          <p className="text-sm mt-2">
            © {new Date().getFullYear()} {profile.businessName}. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
