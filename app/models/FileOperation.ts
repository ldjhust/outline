import { computed } from "mobx";
import { bytesToHumanReadable } from "@shared/utils/files";
import BaseModal from "./BaseModel";
import User from "./User";

class FileOperation extends BaseModal {
  id: string;

  state: string;

  name: string;

  error: string | null;

  collectionId: string | null;

  size: number;

  type: "import" | "export";

  user: User;

  createdAt: string;

  @computed
  get sizeInMB(): string {
    return bytesToHumanReadable(this.size);
  }
}

export default FileOperation;
