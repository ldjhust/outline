import {
  ForeignKey,
  AfterCreate,
  BeforeCreate,
  BelongsTo,
  Column,
  IsIP,
  IsUUID,
  Table,
  DataType,
} from "sequelize-typescript";
import { globalEventQueue } from "../queues";
import Collection from "./Collection";
import Document from "./Document";
import Team from "./Team";
import User from "./User";
import BaseModel from "./base/BaseModel";
import Fix from "./decorators/Fix";

@Table({ tableName: "events", modelName: "event" })
@Fix
class Event extends BaseModel {
  @IsUUID(4)
  @Column(DataType.UUID)
  modelId: string;

  @Column
  name: string;

  @IsIP
  @Column
  ip: string | null;

  @Column(DataType.JSONB)
  data: Record<string, any>;

  // hooks

  @BeforeCreate
  static cleanupIp(model: Event) {
    if (model.ip) {
      // cleanup IPV6 representations of IPV4 addresses
      model.ip = model.ip.replace(/^::ffff:/, "");
    }
  }

  @AfterCreate
  static async enqueue(model: Event) {
    globalEventQueue.add(model);
  }

  // associations

  @BelongsTo(() => User, "userId")
  user: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId: string;

  @BelongsTo(() => Document, "documentId")
  document: Document;

  @ForeignKey(() => Document)
  @Column(DataType.UUID)
  documentId: string;

  @BelongsTo(() => User, "actorId")
  actor: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  actorId: string;

  @BelongsTo(() => Collection, "collectionId")
  collection: Collection;

  @ForeignKey(() => Collection)
  @Column(DataType.UUID)
  collectionId: string;

  @BelongsTo(() => Team, "teamId")
  team: Team;

  @ForeignKey(() => Team)
  @Column(DataType.UUID)
  teamId: string;

  // add can be used to send events into the event system without recording them
  // in the database or audit trail
  static add(event: Partial<Event>) {
    const now = new Date();
    globalEventQueue.add(
      this.build({
        createdAt: now,
        updatedAt: now,
        ...event,
      })
    );
  }

  static ACTIVITY_EVENTS = [
    "collections.create",
    "collections.delete",
    "collections.move",
    "collections.permission_changed",
    "documents.publish",
    "documents.archive",
    "documents.unarchive",
    "documents.move",
    "documents.delete",
    "documents.permanent_delete",
    "documents.restore",
    "revisions.create",
    "users.create",
  ];

  static AUDIT_EVENTS = [
    "api_keys.create",
    "api_keys.delete",
    "authenticationProviders.update",
    "collections.create",
    "collections.update",
    "collections.permission_changed",
    "collections.move",
    "collections.add_user",
    "collections.remove_user",
    "collections.add_group",
    "collections.remove_group",
    "collections.delete",
    "collections.export_all",
    "documents.create",
    "documents.publish",
    "documents.update",
    "documents.archive",
    "documents.unarchive",
    "documents.move",
    "documents.delete",
    "documents.permanent_delete",
    "documents.restore",
    "groups.create",
    "groups.update",
    "groups.delete",
    "pins.create",
    "pins.update",
    "pins.delete",
    "revisions.create",
    "shares.create",
    "shares.update",
    "shares.revoke",
    "teams.update",
    "users.create",
    "users.update",
    "users.signin",
    "users.promote",
    "users.demote",
    "users.invite",
    "users.suspend",
    "users.activate",
    "users.delete",
  ];
}

export default Event;
