import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import ReportsDashboard from "@/components/ReportsDashboard";

export default function ReportsPage() {
  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="relative min-h-screen overflow-x-hidden bg-gray-100">
        <Sidebar />

        <main
          className="relative z-10 min-h-screen"
          style={{ paddingLeft: "calc(68px + 2rem)" }}
        >
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 pb-20">
            <PageHeader
              titleIcon="📊"
              title="Larva History & Reports"
              subtitle="Digital production records and larva sorting history."
              breadcrumbs={[
                { label: "EntoSort" },
                { label: "Dashboard" },
                { label: "Reports" },
              ]}
              status="online"
              animationDelay={0}
            />

            <ReportsDashboard />
          </div>
        </main>
      </div>
    </>
  );
}