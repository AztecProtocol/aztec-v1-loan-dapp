pragma solidity >= 0.5.0 <0.6.0;

contract ILoan {

  address public lender;
  address public borrower;

  function requestAccess() external;

  function approveAccess(address _lender, bytes calldata _sharedSecret) external;

  function settleLoan(
    bytes calldata _proofData,
    bytes32 _currentInterestBalance,
    address _lender
  ) external;

  function confidentialMint(uint24 _proof, bytes calldata _proofData) external;

  function withdrawInterest(
    bytes calldata _proof1,
    bytes calldata _proof2,
    uint256 _interestDurationToWithdraw
  ) external;

  function adjustInterestBalance(bytes calldata _proofData) external;

  function repayLoan(
    bytes calldata _proof1,
    bytes calldata _proof2
  ) external;

  function markLoanAsDefault(bytes calldata _proof1, bytes calldata _proof2, uint256 _interestDurationToWithdraw) external;

  function batchConfidentialApprove(
    bytes32[] calldata _noteHashes,
    address _spender,
    bool[] calldata _spenderApprovals,
    bytes calldata _batchSignature
  ) external;

    function confidentialApprove(
        bytes32 _noteHash,
        address _spender,
        bool _spenderApproval,
        bytes calldata _signature
    ) external;

    function confidentialTransferFrom(uint24 _proof, bytes calldata _proofOutput) external;
  
    function confidentialTransfer(bytes calldata _proofData, bytes calldata _signatures) external;

    function confidentialTransfer(uint24 _proofId, bytes calldata _proofData, bytes calldata _signatures) external;

    function extractAddress(bytes calldata metaData, uint256 addressPos) external returns (address desiredAddress);

    function isOwner() external view returns (bool);

    function owner() external returns (address);

    function renounceOwnership() external;
  
    function setProofs(
        uint8 _epoch,
        uint256 _proofs
    ) external;

    function supportsProof(uint24 _proof) external view returns (bool);

    function transferOwnership(address newOwner) external;

    function updateNoteMetaData(bytes32 noteHash, bytes calldata metaData) external;

    function upgradeRegistryVersion(uint24 _factoryId) external;

    event CreateZkAsset(
        address indexed aceAddress,
        address indexed linkedTokenAddress,
        uint256 scalingFactor,
        bool indexed _canAdjustSupply,
        bool _canConvert
    );

    event CreateNoteRegistry(uint256 noteRegistryId);

    event CreateNote(address indexed owner, bytes32 indexed noteHash, bytes metadata);

    event DestroyNote(address indexed owner, bytes32 indexed noteHash);

    event ConvertTokens(address indexed owner, uint256 value);

    event RedeemTokens(address indexed owner, uint256 value);
    
    event UpdateNoteMetaData(address indexed owner, bytes32 indexed noteHash, bytes metadata);

    event UpdateTotalMinted(bytes32 noteHash, bytes metaData);

}
