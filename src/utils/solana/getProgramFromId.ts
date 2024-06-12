import {
  SystemProgram,
  VOTE_PROGRAM_ID,
  StakeProgram,
  AddressLookupTableProgram,
  TransactionInstruction,
  SystemInstruction,
  VoteInstruction,
  StakeInstruction,
  AddressLookupTableInstruction,
} from '@solana/web3.js'

function decodeSystemInstruction(instruction: TransactionInstruction) {
  const instructionType = SystemInstruction.decodeInstructionType(instruction)
  switch (instructionType) {
    case 'Transfer':
      return {
        type: 'Transfer',
        instruction: SystemInstruction.decodeTransfer(instruction),
      }
    case 'TransferWithSeed':
      return {
        type: 'TransferWithSeed',
        instruction: SystemInstruction.decodeTransferWithSeed(instruction),
      }
    case 'Create':
      return {
        type: 'Create',
        instruction: SystemInstruction.decodeCreateAccount(instruction),
      }
    case 'CreateWithSeed':
      return {
        type: 'CreateWithSeed',
        instruction: SystemInstruction.decodeCreateWithSeed(instruction),
      }
    case 'Allocate':
      return {
        type: 'Allocate',
        instruction: SystemInstruction.decodeAllocate(instruction),
      }
    case 'AllocateWithSeed':
      return {
        type: 'AllocateWithSeed',
        instruction: SystemInstruction.decodeAllocateWithSeed(instruction),
      }
    case 'Assign':
      return {
        type: 'Assign',
        instruction: SystemInstruction.decodeAssign(instruction),
      }
    case 'AssignWithSeed':
      return {
        type: 'AssignWithSeed',
        instruction: SystemInstruction.decodeAssignWithSeed(instruction),
      }
    case 'AdvanceNonceAccount':
      return {
        type: 'AdvanceNonceAccount',
        instruction: SystemInstruction.decodeNonceAdvance(instruction),
      }
    case 'WithdrawNonceAccount':
      return {
        type: 'WithdrawNonceAccount',
        instruction: SystemInstruction.decodeNonceWithdraw(instruction),
      }
    case 'AuthorizeNonceAccount':
      return {
        type: 'AuthorizeNonceAccount',
        instruction: SystemInstruction.decodeNonceAuthorize(instruction),
      }
    case 'InitializeNonceAccount':
      return {
        type: 'InitializeNonceAccount',
        instruction: SystemInstruction.decodeNonceInitialize(instruction),
      }
    default:
      return {
        type: 'Custom Instruction',
        instruction,
      }
  }
}

function decodeVoteInstruction(instruction: TransactionInstruction) {
  const instructionType = VoteInstruction.decodeInstructionType(instruction)
  switch (instructionType) {
    case 'Authorize':
      return {
        type: 'Authorize',
        instruction: VoteInstruction.decodeAuthorize(instruction),
      }
    case 'AuthorizeWithSeed':
      return {
        type: 'AuthorizeWithSeed',
        instruction: VoteInstruction.decodeAuthorizeWithSeed(instruction),
      }
    case 'InitializeAccount':
      return {
        type: 'InitializeAccount',
        instruction: VoteInstruction.decodeInitializeAccount(instruction),
      }
    case 'Withdraw':
      return {
        type: 'Withdraw',
        instruction: VoteInstruction.decodeWithdraw(instruction),
      }
    default:
      return {
        type: 'Custom Instruction',
        instruction,
      }
  }
}

function decodeStakeInstruction(instruction: TransactionInstruction) {
  const instructionType = StakeInstruction.decodeInstructionType(instruction)
  switch (instructionType) {
    case 'Authorize':
      return {
        type: 'Authorize',
        instruction: StakeInstruction.decodeAuthorize(instruction),
      }
    case 'AuthorizeWithSeed':
      return {
        type: 'AuthorizeWithSeed',
        instruction: StakeInstruction.decodeAuthorizeWithSeed(instruction),
      }
    case 'Deactivate':
      return {
        type: 'Deactivate',
        instruction: StakeInstruction.decodeDeactivate(instruction),
      }
    case 'Delegate':
      return {
        type: 'Delegate',
        instruction: StakeInstruction.decodeDelegate(instruction),
      }
    case 'Initialize':
      return {
        type: 'Initialize',
        instruction: StakeInstruction.decodeInitialize(instruction),
      }
    case 'Split':
      return {
        type: 'Split',
        instruction: StakeInstruction.decodeSplit(instruction),
      }
    case 'Merge':
      return {
        type: 'Merge',
        instruction: StakeInstruction.decodeMerge(instruction),
      }
    case 'Withdraw':
      return {
        type: 'Withdraw',
        instruction: StakeInstruction.decodeWithdraw(instruction),
      }
    default:
      return {
        type: 'Custom Instruction',
        instruction,
      }
  }
}

function decodeAddressLookupTableInstruction(
  instruction: TransactionInstruction
) {
  const instructionType =
    AddressLookupTableInstruction.decodeInstructionType(instruction)
  switch (instructionType) {
    case 'CloseLookupTable':
      return {
        type: 'CloseLookupTable',
        instruction:
          AddressLookupTableInstruction.decodeCloseLookupTable(instruction),
      }
    case 'CreateLookupTable':
      return {
        type: 'CreateLookupTable',
        instruction:
          AddressLookupTableInstruction.decodeCreateLookupTable(instruction),
      }
    case 'DeactivateLookupTable':
      return {
        type: 'DeactivateLookupTable',
        instruction:
          AddressLookupTableInstruction.decodeDeactivateLookupTable(
            instruction
          ),
      }
    case 'ExtendLookupTable':
      return {
        type: 'ExtendLookupTable',
        instruction:
          AddressLookupTableInstruction.decodeExtendLookupTable(instruction),
      }
    case 'FreezeLookupTable':
      return {
        type: 'FreezeLookupTable',
        instruction:
          AddressLookupTableInstruction.decodeFreezeLookupTable(instruction),
      }
    default:
      return {
        type: 'Custom Instruction',
        instruction,
      }
  }
}

export function getProgramDetails(instruction: TransactionInstruction) {
  const programId = instruction.programId.toString()
  switch (programId) {
    case SystemProgram.programId.toString():
      return {
        program: 'System Program',
        ...decodeSystemInstruction(instruction),
      }
    case VOTE_PROGRAM_ID.toString():
      return {
        program: 'Vote Program',
        ...decodeVoteInstruction(instruction),
      }
    case StakeProgram.programId.toString():
      return {
        program: 'Stake Program',
        ...decodeStakeInstruction(instruction),
      }
    case AddressLookupTableProgram.programId.toString():
      return {
        program: 'Address Lookup Table Program',
        ...decodeAddressLookupTableInstruction(instruction),
      }
    default:
      return {
        program: 'Custom Program',
        type: 'Custom Instruction',
        instruction,
      }
  }
}
