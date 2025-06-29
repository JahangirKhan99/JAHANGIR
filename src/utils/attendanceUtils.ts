import { AttendanceRecord, AttendanceStats } from '../types';

export function calculateAttendanceStats(
  records: AttendanceRecord[],
  studentId: string,
  subjectId: string
): AttendanceStats {
  const studentSubjectRecords = records.filter(
    record => record.studentId === studentId && record.subjectId === subjectId
  );

  const totalClasses = studentSubjectRecords.length;
  const presentClasses = studentSubjectRecords.filter(record => record.status === 'present').length;
  const absentClasses = totalClasses - presentClasses;
  const percentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  return {
    totalClasses,
    presentClasses,
    absentClasses,
    percentage
  };
}

export function getAttendanceByDate(records: AttendanceRecord[], date: string) {
  return records.filter(record => record.date === date);
}

export function getAttendanceBySubject(records: AttendanceRecord[], subjectId: string) {
  return records.filter(record => record.subjectId === subjectId);
}