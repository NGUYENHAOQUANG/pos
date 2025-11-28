import FarmCard, { FarmType } from '@/shared/components/layout/FarmCard';

export default function TestScreen() {
  const handleEdit = () => console.log('Pressed Edit');
  const handleViewReport = () => console.log('Pressed View Report');
  return (
    <>
      <FarmCard
        id="VN001"
        name="Vùng nuôi Tôm Sú"
        code="VN001"
        type={FarmType.POND}
        stats={{
          totalJobs: 12,
          feed: 4,
          environment: 4,
          shrimpKT: 4,
          measureShrimpSize: 2,
          otherMisc: 1,
          totalPonds: 10,
          activePonds: 8,
          criticalPonds: 1,
          miscPonds: 1,
        }}
        onEdit={handleEdit}
        onViewReport={handleViewReport}
      />
    </>
  );
}