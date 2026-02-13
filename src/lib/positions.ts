// Position constants and validation utilities
export const OFFICER_POSITIONS = [
  'Sekretaris',
  'Bendahara',
] as const;

export const DOSEN_PENDAMPING_POSITION = 'Dosen Pendamping';

// Campus head positions that get photo support
export const KETUA_CAMPUS_POSITIONS = [
  'Ketua Divisi Kampus B',
  'Ketua Divisi Kampus C',
] as const;

// Positions with photo support (leaders displayed with photo cards)
export const PHOTO_POSITIONS = [DOSEN_PENDAMPING_POSITION, ...KETUA_CAMPUS_POSITIONS];

export const MEMBER_POSITION = 'Anggota';

export const ALL_POSITIONS = [DOSEN_PENDAMPING_POSITION, ...KETUA_CAMPUS_POSITIONS, ...OFFICER_POSITIONS, MEMBER_POSITION];

/**
 * Check if a position requires photo support
 */
export function isPhotoPosition(position: string): boolean {
  return PHOTO_POSITIONS.includes(position as any);
}

/**
 * Check if a position is an officer position (not just regular member)
 * Includes both traditional officers and campus head positions
 */
export function isOfficerPosition(position: string): boolean {
  return (
    OFFICER_POSITIONS.includes(position as any) ||
    KETUA_CAMPUS_POSITIONS.includes(position as any)
  );
}

/**
 * Check if a member name already holds an officer position in any division
 */
export async function checkOfficerConflict(
  db: any,
  memberName: string,
  currentDivisionId?: string
): Promise<{ hasConflict: boolean; divisionName?: string; position?: string }> {
  const query = currentDivisionId
    ? `SELECT dm.position, d.name as division_name 
       FROM division_members dm
       JOIN divisions d ON dm.division_id = d.id
       WHERE LOWER(TRIM(dm.member_name)) = LOWER(TRIM(?))
       AND dm.division_id != ?
       AND dm.position != ?`
    : `SELECT dm.position, d.name as division_name 
       FROM division_members dm
       JOIN divisions d ON dm.division_id = d.id
       WHERE LOWER(TRIM(dm.member_name)) = LOWER(TRIM(?))
       AND dm.position != ?`;

  const args = currentDivisionId
    ? [memberName, currentDivisionId, MEMBER_POSITION]
    : [memberName, MEMBER_POSITION];

  const result = await db.execute({
    sql: query,
    args,
  });

  if (result.rows.length > 0) {
    const row = result.rows[0];
    return {
      hasConflict: true,
      divisionName: row.division_name as string,
      position: row.position as string,
    };
  }

  return { hasConflict: false };
}
