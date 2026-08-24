export interface Room {
  id: string;
  userA: number;
  userB: number;
}

const rooms = new Map<string, Room>();

export function createRoom(userA: number, userB: number): Room {
  const id = crypto.randomUUID();
  const room: Room = { id, userA, userB };
  rooms.set(id, room);
  return room;
}

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function otherUser(room: Room, userId: number): number {
  return room.userA === userId ? room.userB : room.userA;
}

export function deleteRoom(roomId: string) {
  rooms.delete(roomId);
}
