import { BedDouble, Hotel, Users } from "lucide-react";
import { getRoomTypes } from "@/app/actions/room-types";
import { CreateRoomTypeForm } from "@/components/room-types/create-room-type-form";
import { requireSession } from "@/lib/auth";

export default async function RoomTypesPage() {
  const session = await requireSession();
  const property = session.currentProperty;
  const roomTypes = await getRoomTypes();
  const totalRooms = roomTypes.reduce(
    (total, roomType) => total + roomType.total_rooms,
    0,
  );

  return (
    <main className="flex-1 space-y-4 p-2 sm:p-4 md:space-y-6 md:p-6 lg:p-8 min-w-0">
      <section className="rounded-[24px] border border-white bg-white p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:rounded-[32px] md:p-6">
        <div className="flex flex-col gap-6 border-b border-slate-100 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--color-accent)] md:text-sm">
              Inventory
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
              Room Types
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Manage room categories for {property?.name ?? "your property"} so
              rates and availability can sync against real backend inventory.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:w-80">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Types
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {roomTypes.length}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Rooms
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {totalRooms}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
          <section className="rounded-[28px] border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  Current room types
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Backend room inventory connected to this property.
                </p>
              </div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                <Hotel className="h-5 w-5" />
              </div>
            </div>

            {roomTypes.length > 0 ? (
              <>
                {/* Mobile View: Card-based layout */}
                <div className="mt-5 space-y-4 md:hidden">
                  {roomTypes.map((roomType) => (
                    <div
                      key={roomType.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="space-y-2">
                        <h4 className="break-words font-semibold text-slate-900">
                          {roomType.name}
                        </h4>
                        <p className="break-words text-sm text-slate-500">
                          {roomType.description || "No description provided."}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                            Bed Type
                          </p>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <BedDouble className="h-4 w-4 text-[var(--color-accent)]" />
                            <span>{roomType.bed_type || "Not set"}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                            Occupancy
                          </p>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Users className="h-4 w-4 text-[var(--color-accent)]" />
                            <span>{roomType.max_occupancy} guests</span>
                          </div>
                        </div>
                        <div className="col-span-2 space-y-1">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                            Inventory
                          </p>
                          <div>
                            <span className="inline-flex rounded-full bg-[var(--color-accent)]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                              {roomType.total_rooms} rooms
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View: Table layout */}
                <div className="mt-5 hidden overflow-hidden rounded-3xl border border-slate-200 md:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Room type</th>
                        <th className="px-4 py-3 font-medium">Beds</th>
                        <th className="px-4 py-3 font-medium">Occupancy</th>
                        <th className="px-4 py-3 font-medium">Inventory</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roomTypes.map((roomType) => (
                        <tr
                          key={roomType.id}
                          className="border-t border-slate-100 hover:bg-slate-50/50"
                        >
                          <td className="px-4 py-4">
                            <p className="font-semibold text-slate-900">
                              {roomType.name}
                            </p>
                            <p className="mt-1 max-w-md text-sm text-slate-500">
                              {roomType.description ||
                                "No description provided."}
                            </p>
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            <span className="inline-flex items-center gap-2">
                              <BedDouble className="h-4 w-4 text-[var(--color-accent)]" />
                              {roomType.bed_type || "Not set"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            <span className="inline-flex items-center gap-2">
                              <Users className="h-4 w-4 text-[var(--color-accent)]" />
                              {roomType.max_occupancy}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                              {roomType.total_rooms} rooms
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="mt-5 rounded-3xl bg-slate-50 px-5 py-8 text-center">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[var(--color-accent)] shadow-sm">
                  <Hotel className="h-5 w-5" />
                </div>
                <h4 className="mt-4 text-base font-semibold text-slate-950">
                  No room types found
                </h4>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Create at least one room type before running channel manager
                  inventory updates.
                </p>
              </div>
            )}
          </section>

          <CreateRoomTypeForm />
        </div>
      </section>
    </main>
  );
}
