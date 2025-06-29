import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Student, Subject, AttendanceRecord } from '../types';
import { calculateAttendanceStats } from './attendanceUtils';

export async function generateAttendanceReport(
  students: Student[],
  subjects: Subject[],
  attendanceRecords: AttendanceRecord[],
  selectedSubject?: string
): Promise<void> {
  try {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: 'BS Student Attendance Report',
      subject: 'Attendance Management',
      author: 'BS Attendance System',
      creator: 'BS Attendance System'
    });
    
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('BS Student Attendance Report', 14, 20);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 30);
    doc.text(`Time: ${format(new Date(), 'pp')}`, 14, 37);
    
    let startY = 45;
    
    if (selectedSubject) {
      const subject = subjects.find(s => s.id === selectedSubject);
      if (subject) {
        doc.setFont('helvetica', 'bold');
        doc.text(`Subject: ${subject.name} (${subject.code})`, 14, startY);
        doc.text(`Credits: ${subject.credits} | Semester: ${subject.semester}`, 14, startY + 7);
        startY += 20;
      }
    } else {
      doc.setFont('helvetica', 'bold');
      doc.text('Overall Attendance Report - All Subjects', 14, startY);
      startY += 15;
    }
    
    // Prepare table data
    const tableData: (string | number)[][] = [];
    
    students.forEach(student => {
      if (selectedSubject) {
        // Subject-specific report
        const stats = calculateAttendanceStats(attendanceRecords, student.id, selectedSubject);
        tableData.push([
          student.rollNumber,
          student.name,
          student.program,
          student.semester,
          stats.totalClasses,
          stats.presentClasses,
          stats.absentClasses,
          `${stats.percentage}%`
        ]);
      } else {
        // Overall report across all subjects
        let totalClasses = 0;
        let totalPresent = 0;
        
        subjects.forEach(subject => {
          const stats = calculateAttendanceStats(attendanceRecords, student.id, subject.id);
          totalClasses += stats.totalClasses;
          totalPresent += stats.presentClasses;
        });
        
        const overallPercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;
        
        tableData.push([
          student.rollNumber,
          student.name,
          student.program,
          student.semester,
          totalClasses,
          totalPresent,
          totalClasses - totalPresent,
          `${overallPercentage}%`
        ]);
      }
    });
    
    // Table headers
    const headers = [
      'Roll No',
      'Student Name',
      'Program',
      'Semester',
      'Total Classes',
      'Present',
      'Absent',
      selectedSubject ? 'Attendance %' : 'Overall %'
    ];
    
    // Generate table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: startY,
      theme: 'striped',
      headStyles: { 
        fillColor: [37, 99, 235], // Blue color
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Roll No
        1: { cellWidth: 40 }, // Name
        2: { cellWidth: 35 }, // Program
        3: { cellWidth: 20 }, // Semester
        4: { cellWidth: 20 }, // Total
        5: { cellWidth: 20 }, // Present
        6: { cellWidth: 20 }, // Absent
        7: { cellWidth: 25 }  // Percentage
      },
      margin: { top: 10, right: 14, bottom: 10, left: 14 },
      didDrawPage: function (data) {
        // Add page numbers
        const pageCount = doc.getNumberOfPages();
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          data.settings.margin.left,
          pageHeight - 10
        );
      }
    });
    
    // Add summary statistics
    const finalY = (doc as any).lastAutoTable.finalY || startY + 50;
    
    if (finalY < doc.internal.pageSize.height - 60) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary Statistics:', 14, finalY + 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const totalStudents = students.length;
      const totalSubjectsCount = selectedSubject ? 1 : subjects.length;
      const totalRecords = attendanceRecords.filter(r => 
        selectedSubject ? r.subjectId === selectedSubject : true
      ).length;
      
      doc.text(`Total Students: ${totalStudents}`, 14, finalY + 30);
      doc.text(`Total Subjects: ${totalSubjectsCount}`, 14, finalY + 37);
      doc.text(`Total Attendance Records: ${totalRecords}`, 14, finalY + 44);
      
      if (selectedSubject) {
        const subject = subjects.find(s => s.id === selectedSubject);
        doc.text(`Subject Details: ${subject?.name} (${subject?.code})`, 14, finalY + 51);
      }
    }
    
    // Generate filename
    const fileName = selectedSubject 
      ? `attendance-${subjects.find(s => s.id === selectedSubject)?.code?.toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
      : `attendance-overall-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    
    // Save the PDF
    doc.save(fileName);
    
    // Show success message
    if (typeof window !== 'undefined') {
      const message = `PDF report "${fileName}" has been downloaded successfully!`;
      
      // Create a temporary success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
      notification.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span class="text-sm font-medium">${message}</span>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      // Remove notification after 5 seconds
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 5000);
    }
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Show error message
    if (typeof window !== 'undefined') {
      const errorNotification = document.createElement('div');
      errorNotification.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
      errorNotification.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span class="text-sm font-medium">Error generating PDF. Please try again.</span>
        </div>
      `;
      
      document.body.appendChild(errorNotification);
      
      setTimeout(() => {
        if (document.body.contains(errorNotification)) {
          document.body.removeChild(errorNotification);
        }
      }, 5000);
    }
    
    throw error;
  }
}